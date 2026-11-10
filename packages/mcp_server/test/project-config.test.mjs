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
    // A short color goes out long, which <input type="color"> can show.
    assert.deepEqual(updates, [{ primary_color: "#0070F4", secondary_color: "#ff55bb" }]);
    await close();
});

// The CMS's locale is a date-fns key ("es", "enUS", "ptBR"), handed to date-fns and Intl.

test("update_default_locale stores a FireCMS locale, whatever spelling it comes in", async () => {
    const { call, updates, close } = await withTools();
    for (const locale of ["es", "en", "en_US", "en-us", "pt-BR", "ptBR"]) {
        const result = await call("update_default_locale", { projectId: "p", locale });
        assert.equal(result.isError, false, `${locale}: ${result.text}`);
    }
    assert.deepEqual(updates.map((u) => u.default_locale), ["es", "en", "enUS", "enUS", "ptBR", "ptBR"]);
    await close();
});

test("update_default_locale refuses what isn't a FireCMS locale, naming the closest", async () => {
    const { call, updates, close } = await withTools();
    const regional = await call("update_default_locale", { projectId: "p", locale: "es-MX" });
    assert.equal(regional.isError, true);
    assert.match(regional.text, /closest one supported is 'es'/);
    for (const locale of ["", "x", "klingon"]) {
        const result = await call("update_default_locale", { projectId: "p", locale });
        assert.equal(result.isError, true, locale);
    }
    assert.deepEqual(updates, []);
    await close();
});

// JSON Schema patterns carry no flags: a published `/i` pattern refused the tool's own
// example, "#0070F4", in clients that check arguments against the schema.
test("the published color pattern accepts upper and lower case, and each field has its own", async () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerProjectConfigTools(server, { assertAdmin: async () => {}, updateProjectConfig: async () => ({}) });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test-client", version: "0.0.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const tool = (await client.listTools()).tools.find((t) => t.name === "update_project_colors");
    for (const field of ["primaryColor", "secondaryColor"]) {
        const schema = tool.inputSchema.properties[field];
        assert.equal(schema.$ref, undefined, `${field} is inlined`);
        const pattern = new RegExp(schema.pattern);
        assert.ok(pattern.test("#0070F4") && pattern.test("#ff5b79") && pattern.test("#07F"), `${field}: ${schema.pattern}`);
        assert.ok(!pattern.test("red"));
    }
    await client.close();
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
