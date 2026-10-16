import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Access, Field, Tab } from "payload";
import { siteContentAccess, siteManagers } from "../../src/cms/access";
import { Media } from "../../src/collections/Media";
import { Sites } from "../../src/collections/Sites";

type AccessArgs = Parameters<Access>[0];
const as = (user: unknown, data?: Record<string, unknown>) => ({ req: { user }, data }) as unknown as AccessArgs;

const admin = { id: 1, role: "admin" };
const growingEditor = { id: 2, role: "editor", sites: [10] };
const anyEditor = { id: 3, role: "editor", sites: [] };
const hikviewEditor = { id: 4, role: "editor", sites: [{ id: 11, key: "hikview" }] };

describe("siteContentAccess().create", () => {
  const { create } = siteContentAccess();

  it("lets an editor create on a site they manage", async () => {
    assert.equal(await create(as(growingEditor, { site: 10 })), true);
  });

  it("refuses a site the editor doesn't manage", async () => {
    assert.equal(await create(as(growingEditor, { site: 11 })), false);
  });

  it("lets an editor create without sending a site: the hidden field defaults to their workspace", async () => {
    assert.equal(await create(as(growingEditor, { title: "Nouvelle page" })), true);
  });

  it("refuses visitors", async () => {
    assert.equal(await create(as(null, { site: 10 })), false);
  });
});

describe("siteManagers", () => {
  it("lets administrators and unrestricted editors change every site", async () => {
    assert.equal(await siteManagers(as(admin)), true);
    assert.equal(await siteManagers(as(anyEditor)), true);
  });

  it("limits an editor to the sites they manage", async () => {
    assert.deepEqual(await siteManagers(as(growingEditor)), { id: { in: [10] } });
  });

  it("refuses visitors", async () => {
    assert.equal(await siteManagers(as(null)), false);
  });
});

describe("Sites form", () => {
  const tabs = (Sites.fields[0] as { tabs: Tab[] }).tabs;
  const labelOf = (tab: Tab) => (tab.label as { en: string }).en;
  /** Named fields of a tab, looking inside rows. */
  const named = (fields: Field[]): Field[] =>
    fields.flatMap((field) => (field.type === "row" ? named(field.fields) : [field]));
  const editorMayUpdate = (field: Field) =>
    !("access" in field) || !field.access?.update || field.access.update({ req: { user: growingEditor } } as never);

  it("keeps five everyday tabs, then Advanced", () => {
    assert.deepEqual(tabs.map(labelOf), ["Contact", "Brand", "Menu", "Footer", "Key figures", "Advanced"]);
  });

  it("locks every Advanced field to administrators, also through the API", () => {
    const advanced = named(tabs.at(-1)!.fields);
    const names = advanced.map((field) => ("name" in field ? field.name : ""));
    for (const expected of ["key", "isDefault", "url", "domains", "companyName", "legalName", "matriculeFiscal", "rne", "notify"]) {
      assert.ok(names.includes(expected), expected);
    }
    for (const field of advanced) {
      assert.equal(editorMayUpdate(field), false, "name" in field ? field.name : field.type);
      assert.equal((field as { access: { update: (args: never) => boolean } }).access.update({ req: { user: admin } } as never), true);
    }
  });

  it("hides the Advanced tab from editors", () => {
    const condition = tabs.at(-1)!.admin!.condition!;
    assert.equal(condition({}, {}, { user: growingEditor } as never), false);
    assert.equal(condition({}, {}, { user: admin } as never), true);
  });

  it("leaves the everyday tabs editable by the company's staff", () => {
    for (const tab of tabs.slice(0, -1)) {
      assert.equal(tab.admin?.condition, undefined, labelOf(tab));
      for (const field of named(tab.fields)) assert.equal(editorMayUpdate(field), true, labelOf(tab));
    }
  });
});

describe("Media access", () => {
  const access = Media.access!;
  const call = (fn: Access | undefined, user: unknown, data?: Record<string, unknown>) => fn!(as(user, data));
  const sitesField = Media.fields.find((field) => "name" in field && field.name === "sites") as Field & {
    hasMany: boolean;
    access: { update: (args: never) => boolean };
    filterOptions: (args: never) => unknown;
  };

  it("keeps images public, also for editors of another company (files are served through read)", async () => {
    for (const user of [null, hikviewEditor, growingEditor, admin]) assert.equal(await call(access.read, user), true);
  });

  it("limits an editor's changes to their companies' images", async () => {
    assert.deepEqual(await call(access.update, hikviewEditor), { sites: { in: [11] } });
    assert.deepEqual(await call(access.update, growingEditor), { sites: { in: [10] } });
    assert.equal(await call(access.update, admin), true);
    assert.equal(await call(access.update, anyEditor), true);
    assert.equal(await call(access.update, null), false);
  });

  it("lets an editor upload for their own company only", async () => {
    assert.equal(await call(access.create, hikviewEditor, { alt: "x", sites: [11] }), true);
    assert.equal(await call(access.create, hikviewEditor, { alt: "x" }), true);
    assert.equal(await call(access.create, hikviewEditor, { alt: "x", sites: [10] }), false);
    assert.equal(await call(access.create, hikviewEditor, { alt: "x", sites: [11, 10] }), false);
    assert.equal(await call(access.create, null, { alt: "x", sites: [11] }), false);
  });

  it("leaves deleting to administrators", async () => {
    assert.equal(await call(access.delete, admin), true);
    assert.equal(await call(access.delete, hikviewEditor), false);
    assert.equal(await call(access.delete, anyEditor), false);
  });

  it("lets only administrators share an image with, or move it to, another site", async () => {
    assert.equal(sitesField.hasMany, true);
    assert.equal(sitesField.access.update({ req: { user: hikviewEditor } } as never), false);
    assert.equal(sitesField.access.update({ req: { user: admin } } as never), true);
  });

  it("offers an editor their own sites on upload, and keeps another company's site on a shared image", () => {
    assert.deepEqual(sitesField.filterOptions({ user: hikviewEditor } as never), { id: { in: [11] } });
    assert.equal(sitesField.filterOptions({ id: 5, user: hikviewEditor } as never), true);
    assert.equal(sitesField.filterOptions({ user: admin } as never), true);
  });
});
