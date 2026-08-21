import test from "node:test";
import assert from "node:assert/strict";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { registerIntrospectionTools } from "../dist/tools/introspection.js";

async function withTools(api) {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerIntrospectionTools(server, { assertAdmin: async () => undefined, ...api });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test-client", version: "0.0.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    return {
        client,
        call: async (name, args = {}) => {
            const res = await client.callTool({ name, arguments: args });
            return { isError: Boolean(res.isError), text: res.content?.[0]?.text ?? "" };
        },
        close: () => client.close()
    };
}

const docs = (values) => ({ documents: values.map((v, i) => ({ id: `d${i}`, values: v })) });

const permissionDenied = () => {
    const e = new Error("Request failed");
    e.response = { status: 500, data: { code: "internal-error", message: "7 PERMISSION_DENIED: Missing or insufficient permissions." } };
    return e;
};

test("a permission error explains the propagation window after connecting", async () => {
    // Observed for real: connecting a project and immediately reading its data fails
    // this way while the delegated service account's roles propagate.
    const { call, close } = await withTools({
        listDocuments: async () => { throw permissionDenied(); }
    });

    const res = await call("preview_inferred_schema", { projectId: "p", path: "guests" });

    assert.equal(res.isError, true);
    assert.match(res.text, /PERMISSION_DENIED/);
    assert.match(res.text, /still propagating|try again/i);
    await close();
});

test("the same explanation reaches the other introspection tools", async () => {
    const { call, close } = await withTools({
        listDatabases: async () => { throw permissionDenied(); }
    });

    const res = await call("list_databases", { projectId: "p" });

    assert.equal(res.isError, true);
    assert.match(res.text, /still propagating|try again/i);
    await close();
});

test("an unrelated error is passed through unembellished", async () => {
    const { call, close } = await withTools({
        listDocuments: async () => {
            const e = new Error("Request failed");
            e.response = { status: 404, data: { message: "Project not found" } };
            throw e;
        }
    });

    const res = await call("preview_inferred_schema", { projectId: "p", path: "guests" });

    assert.match(res.text, /Project not found/);
    assert.doesNotMatch(res.text, /propagating/i);
    await close();
});

test("preview infers types from the sampled documents", async () => {
    const { call, close } = await withTools({
        listDocuments: async () => docs([
            { name: "Ana", attending: true, plusOnes: 1, email: "ana@example.com" },
            { name: "Bruno", attending: false, plusOnes: 0, email: "bruno@example.com" }
        ])
    });

    const res = await call("preview_inferred_schema", { projectId: "p", path: "guests" });
    const json = JSON.parse(res.text.slice(res.text.indexOf("{")));

    assert.equal(res.isError, false);
    assert.equal(json.id, "guests");
    assert.equal(json.properties.name.dataType, "string");
    assert.equal(json.properties.attending.dataType, "boolean");
    assert.equal(json.properties.plusOnes.dataType, "number");
    await close();
});

test("preview recognises the serialised Firestore types", async () => {
    // The backend sends these as sentinels, not SDK instances.
    const { call, close } = await withTools({
        listDocuments: async () => docs([
            { when: { _seconds: 1800000000, _nanoseconds: 0 }, who: { _ref: "users/abc" }, where: { _lat: 1, _long: 2 } },
            { when: { _seconds: 1800000001, _nanoseconds: 0 }, who: { _ref: "users/def" }, where: { _lat: 3, _long: 4 } }
        ])
    });

    const res = await call("preview_inferred_schema", { projectId: "p", path: "events" });
    const json = JSON.parse(res.text.slice(res.text.indexOf("{")));

    assert.equal(json.properties.when.dataType, "date");
    assert.equal(json.properties.who.dataType, "reference");
    assert.equal(json.properties.where.dataType, "geopoint");
    await close();
});

test("preview saves nothing and says so", async () => {
    const { call, close } = await withTools({
        listDocuments: async () => docs([{ a: 1 }])
    });

    const res = await call("preview_inferred_schema", { projectId: "p", path: "things" });

    assert.match(res.text, /Nothing has been saved/i);
    await close();
});

test("preview refuses an empty path rather than inventing a schema", async () => {
    const { call, close } = await withTools({ listDocuments: async () => docs([]) });

    const res = await call("preview_inferred_schema", { projectId: "p", path: "empty" });

    assert.equal(res.isError, true);
    assert.match(res.text, /No documents found/i);
    await close();
});

test("infer_collections_from_data refuses paths with no documents", async () => {
    let setupCalled = false;
    const { call, close } = await withTools({
        listDocuments: async () => docs([]),
        setupCollections: async () => { setupCalled = true; return { collections: [] }; }
    });

    const res = await call("infer_collections_from_data", { projectId: "p", paths: [{ path: "empty" }] });

    assert.equal(res.isError, true);
    assert.match(res.text, /invented/i);
    assert.equal(setupCalled, false);
    await close();
});

test("infer_collections_from_data passes through the paths that do have data", async () => {
    let received;
    const { call, close } = await withTools({
        listDocuments: async (_p, { path }) => (path === "empty" ? docs([]) : docs([{ a: 1 }])),
        setupCollections: async (_p, paths) => {
            received = paths;
            return { collections: [{ id: "full", path: "full", properties: { a: { dataType: "number" } } }] };
        }
    });

    const res = await call("infer_collections_from_data", { projectId: "p", paths: [{ path: "full" }, { path: "empty" }] });

    assert.deepEqual(received, [{ path: "full" }]);
    assert.match(res.text, /Skipped "empty"/);
    assert.equal(res.isError, false);
    await close();
});

test("setup_all_collections reads the live listing, not the cached one", async () => {
    // The cached endpoint lags, which silently made this a no-op on a project whose
    // data had only just arrived.
    let liveCalled = false;
    const { call, close } = await withTools({
        listRootCollectionsLive: async () => { liveCalled = true; return ["guests"]; },
        getRootCollections: async () => { throw new Error("the cached endpoint must not be used here"); },
        listCollectionSchemas: async () => [],
        setupCollections: async () => ({ collections: [{ id: "guests", path: "guests", properties: { name: { dataType: "string" } } }] })
    });

    const res = await call("setup_all_collections", { projectId: "p" });

    assert.equal(liveCalled, true);
    assert.equal(res.isError, false);
    assert.match(res.text, /guests/);
    await close();
});

test("setup_all_collections skips collections that are already mapped", async () => {
    let setupCalled = false;
    const { call, close } = await withTools({
        listRootCollectionsLive: async () => ["guests"],
        listCollectionSchemas: async () => [{ id: "guests", path: "guests" }],
        setupCollections: async () => { setupCalled = true; return { collections: [] }; }
    });

    const res = await call("setup_all_collections", { projectId: "p" });

    assert.equal(setupCalled, false, "nothing to do, so the backend should not be called");
    assert.match(res.text, /already mapped/i);
    await close();
});

test("setup_all_collections says so when the project has no data at all", async () => {
    const { call, close } = await withTools({
        listRootCollectionsLive: async () => [],
        listCollectionSchemas: async () => []
    });

    const res = await call("setup_all_collections", { projectId: "p" });

    assert.match(res.text, /no root collections/i);
    await close();
});
