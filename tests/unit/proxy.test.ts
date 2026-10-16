import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import proxy from "../../src/proxy";

const run = (url: string) => proxy(new NextRequest(url, { headers: { host: new URL(url).host } }));

describe("proxy: locale + site rewrite", () => {
  it("rewrites an already-localized URL to /<host>/<locale>/…", () => {
    const response = run("http://growing.localhost:3100/fr/services?x=1");
    const rewrite = new URL(response.headers.get("x-middleware-rewrite")!);
    assert.equal(rewrite.pathname, "/growing.localhost/fr/services");
    assert.equal(rewrite.search, "?x=1");
    assert.equal(response.headers.get("x-middleware-next"), null);
  });

  it("keeps the site per hostname", () => {
    const rewrite = run("http://hikview.localhost:3100/ar").headers.get("x-middleware-rewrite")!;
    assert.equal(new URL(rewrite).pathname, "/hikview.localhost/ar");
  });

  it("redirects a URL without a locale, without rewriting it", () => {
    const response = run("http://growing.localhost:3100/services");
    assert.match(String(response.status), /^30[78]$/);
    assert.match(response.headers.get("location")!, /\/(fr|ar|en)\/services$/);
    assert.equal(response.headers.get("x-middleware-rewrite"), null);
  });

  it("never redirects to another origin", () => {
    for (const path of ["//evil.com", "/\\evil.com", "//evil.com/fr"]) {
      const location = run(`http://growing.localhost:3100${path}`).headers.get("location");
      if (location) assert.equal(new URL(location).host, "growing.localhost:3100", path);
    }
  });
});
