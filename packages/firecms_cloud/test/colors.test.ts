import test from "node:test";
import assert from "node:assert/strict";

import { darkenColor, hexColorOr } from "../src/utils/colors.ts";

// On 2026-11-10 a project color that wasn't hex, stored through the MCP server, made
// darkenColor throw inside the theme effect and took the project's whole CMS down.

test("hexColorOr keeps the colors darkenColor can read", () => {
    assert.equal(hexColorOr("#0070F4", "#000000"), "#0070F4");
    assert.equal(hexColorOr("#07f", "#000000"), "#07f");
    assert.equal(hexColorOr(" #ff5b79 ", "#000000"), "#ff5b79");
});

test("hexColorOr falls back for anything else", () => {
    for (const value of ["red", "rgb(0, 112, 244)", "#0070F4FF", "0070F4", "#12345", "", undefined, null, 42, {}]) {
        assert.equal(hexColorOr(value, "#0070F4"), "#0070F4", String(value));
    }
});

test("whatever hexColorOr returns, darkenColor can darken", () => {
    for (const value of ["#0070F4", "#07f", "not a color", undefined]) {
        assert.doesNotThrow(() => darkenColor(hexColorOr(value, "#0070F4")));
    }
});
