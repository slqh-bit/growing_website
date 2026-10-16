import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pickWorkspace, readCookie, workspaceWhere, WORKSPACE_COOKIE } from "../../src/cms/workspace";

describe("readCookie", () => {
  it("reads a cookie among others", () => {
    assert.equal(readCookie(`payload-token=abc; ${WORKSPACE_COOKIE}=2; lng=fr`, WORKSPACE_COOKIE), "2");
    assert.equal(readCookie(`${WORKSPACE_COOKIE}=7`, WORKSPACE_COOKIE), "7");
  });

  it("returns null when the cookie or the header is missing", () => {
    assert.equal(readCookie("payload-token=abc", WORKSPACE_COOKIE), null);
    assert.equal(readCookie("", WORKSPACE_COOKIE), null);
    assert.equal(readCookie(null, WORKSPACE_COOKIE), null);
    assert.equal(readCookie(undefined, WORKSPACE_COOKIE), null);
  });

  it("doesn't match a cookie whose name only ends with the one asked for", () => {
    assert.equal(readCookie(`x-${WORKSPACE_COOKIE}=9`, WORKSPACE_COOKIE), null);
  });

  it("decodes the value and survives a malformed one", () => {
    assert.equal(readCookie(`${WORKSPACE_COOKIE}=a%20b`, WORKSPACE_COOKIE), "a b");
    assert.equal(readCookie(`${WORKSPACE_COOKIE}=%E0%A4%A`, WORKSPACE_COOKIE), "%E0%A4%A");
  });
});

describe("pickWorkspace", () => {
  it("keeps the requested site when the user manages it (ids may be numbers)", () => {
    assert.equal(pickWorkspace("2", [1, 2, 3]), 2);
    assert.equal(pickWorkspace("b", ["a", "b"]), "b");
  });

  it("falls back to the first managed site for a site the user doesn't manage", () => {
    assert.equal(pickWorkspace("3", [1, 2]), 1);
    assert.equal(pickWorkspace("1 OR 1=1", [5]), 5);
  });

  it("falls back to the first managed site when nothing is requested", () => {
    assert.equal(pickWorkspace(null, [4, 5]), 4);
    assert.equal(pickWorkspace("", [4, 5]), 4);
  });

  it("has no workspace when the user manages no site", () => {
    assert.equal(pickWorkspace("1", []), null);
    assert.equal(pickWorkspace(null, []), null);
  });
});

describe("workspaceWhere", () => {
  it("filters single-site documents on their site", () => {
    assert.deepEqual(workspaceWhere("site", 2), { site: { equals: 2 } });
  });

  it("filters shared documents on the sites they are published on", () => {
    assert.deepEqual(workspaceWhere("sites", 2), { sites: { in: [2] } });
  });

  it("doesn't filter without a workspace", () => {
    assert.equal(workspaceWhere("site", null), null);
    assert.equal(workspaceWhere("sites", null), null);
  });
});
