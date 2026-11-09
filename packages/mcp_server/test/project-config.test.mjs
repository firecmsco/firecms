import test from "node:test";
import assert from "node:assert/strict";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { registerProjectConfigTools } from "../dist/tools/project-config.js";

/**
 * The real tool handlers over an in-memory transport, with a stand-in API client that
 * records every config update it is asked to store.
 */
async function withTools() {
    const updates = [];
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerProjectConfigTools(server, {
        assertAdmin: async () => {},
        updateProjectConfig: async (projectId, data) => { updates.push(data); return { message: "Config updated" }; }
    });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test-client", version: "0.0.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    return {
        updates,
        call: async (name, args) => {
            try {
                const res = await client.callTool({ name, arguments: args });
                return { isError: Boolean(res.isError), text: res.content?.[0]?.text ?? "" };
            } catch (error) {
                // Older SDKs answer invalid arguments with a protocol error instead.
                return { isError: true, text: error.message };
            }
        },
        close: () => client.close()
    };
}

// On 2026-11-10 a color that isn't hex, stored through update_project_colors, made the
// project's CMS crash on load, and update_default_locale stored "en_US".

test("update_project_colors refuses colors that aren't #rgb or #rrggbb", async () => {
    const { call, updates, close } = await withTools();
    for (const color of ["red", "rgb(0, 112, 244)", "#0070F4FF", "0070F4", "#12345"]) {
        const result = await call("update_project_colors", { projectId: "p", primaryColor: color });
        assert.equal(result.isError, true, color);
        assert.match(result.text, /hex color/, color);
    }
    const secondary = await call("update_project_colors", { projectId: "p", secondaryColor: "blue" });
    assert.equal(secondary.isError, true);
    assert.deepEqual(updates, []);
    await close();
});

test("update_project_colors stores hex colors", async () => {
    const { call, updates, close } = await withTools();
    const result = await call("update_project_colors", { projectId: "p", primaryColor: "#0070F4", secondaryColor: " #f5b " });
    assert.equal(result.isError, false, result.text);
    assert.deepEqual(updates, [{ primary_color: "#0070F4", secondary_color: "#f5b" }]);
    await close();
});

test("update_default_locale refuses what Intl can't read, and stores the canonical tag", async () => {
    const { call, updates, close } = await withTools();
    for (const locale of ["en_US", "", "x"]) {
        const result = await call("update_default_locale", { projectId: "p", locale });
        assert.equal(result.isError, true, locale);
    }
    assert.deepEqual(updates, []);

    const result = await call("update_default_locale", { projectId: "p", locale: "en-us" });
    assert.equal(result.isError, false, result.text);
    assert.deepEqual(updates, [{ default_locale: "en-US" }]);
    await close();
});

test("update_project_name refuses an empty name and trims a good one", async () => {
    const { call, updates, close } = await withTools();
    for (const name of ["", "   "]) {
        const result = await call("update_project_name", { projectId: "p", name });
        assert.equal(result.isError, true, JSON.stringify(name));
    }
    assert.deepEqual(updates, []);

    const result = await call("update_project_name", { projectId: "p", name: "  Acme CMS " });
    assert.equal(result.isError, false, result.text);
    assert.deepEqual(updates, [{ name: "Acme CMS" }]);
    await close();
});
