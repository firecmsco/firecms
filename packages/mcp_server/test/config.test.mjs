import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_API_URL, resolveApiUrl, isCustomApiUrl } from "../dist/config.js";

test("defaults to FireCMS Cloud when nothing is configured", () => {
    assert.equal(resolveApiUrl({}), DEFAULT_API_URL);
    assert.equal(DEFAULT_API_URL, "https://api.firecms.co");
});

test("an empty or blank variable is treated as unset", () => {
    // An exported-but-empty variable is a common shell accident; falling back to
    // Cloud is safer than requesting "/config" against an empty host.
    assert.equal(resolveApiUrl({ FIRECMS_API_URL: "" }), DEFAULT_API_URL);
    assert.equal(resolveApiUrl({ FIRECMS_API_URL: "   " }), DEFAULT_API_URL);
});

test("uses a configured backend", () => {
    assert.equal(
        resolveApiUrl({ FIRECMS_API_URL: "https://api-kdoe6pj3qq-ey.a.run.app" }),
        "https://api-kdoe6pj3qq-ey.a.run.app"
    );
});

test("trims trailing slashes so paths do not double up", () => {
    // Every caller concatenates, e.g. `${resolveApiUrl()}/config`.
    assert.equal(resolveApiUrl({ FIRECMS_API_URL: "https://example.com/" }), "https://example.com");
    assert.equal(resolveApiUrl({ FIRECMS_API_URL: "https://example.com///" }), "https://example.com");
});

test("keeps a path prefix, which self-hosted backends use", () => {
    assert.equal(
        resolveApiUrl({ FIRECMS_API_URL: "http://localhost:5001/firecms-dev/europe-west3/api" }),
        "http://localhost:5001/firecms-dev/europe-west3/api"
    );
});

test("surrounding whitespace is ignored", () => {
    assert.equal(resolveApiUrl({ FIRECMS_API_URL: "  https://example.com  " }), "https://example.com");
});

test("reports whether the target is Cloud", () => {
    assert.equal(isCustomApiUrl({}), false);
    assert.equal(isCustomApiUrl({ FIRECMS_API_URL: DEFAULT_API_URL }), false);
    assert.equal(isCustomApiUrl({ FIRECMS_API_URL: DEFAULT_API_URL + "/" }), false);
    assert.equal(isCustomApiUrl({ FIRECMS_API_URL: "https://staging.example.com" }), true);
});
