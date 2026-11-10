import test from "node:test";
import assert from "node:assert/strict";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { FireCMSApiClient } from "../dist/api-client.js";
import { registerDocumentTools } from "../dist/tools/documents.js";

const session = { email: async () => "admin@example.test", backendIdToken: async () => "token", googleAccessToken: async () => undefined };

/** The API client with its HTTP call replaced by one that records each request. */
function recordingClient() {
    const api = new FireCMSApiClient({ session, apiUrl: "http://127.0.0.1:1" });
    const requests = [];
    api.request = async (config) => { requests.push(config); return { totalOperations: 0, failures: [] }; };
    return { api, requests };
}

// import_documents with merge: true sent plain updates, which fail on a document that
// doesn't exist yet and take every other document of the batch down with them. Without
// an ID a document always got a new random one, so such an import could never succeed.

test("a merge import asks the backend to merge, and adds new documents with set", async () => {
    const { api, requests } = recordingClient();
    await api.importDocuments("p", {
        path: "products",
        merge: true,
        documents: [{ id: "existing", data: { price: 3 } }, { data: { title: "No id" } }],
    });

    const [first, second] = requests[0].data.operations;
    assert.deepEqual(first, { type: "update", merge: true, path: "products", documentId: "existing", data: { price: 3 } });
    assert.equal(second.type, "set");
    assert.equal(second.merge, undefined);
    assert.match(second.documentId, /^[A-Za-z0-9]{20}$/);
});

test("an import without merge still overwrites with set", async () => {
    const { api, requests } = recordingClient();
    await api.importDocuments("p", { path: "products", documents: [{ id: "a", data: { x: 1 } }] });
    assert.deepEqual(requests[0].data.operations, [{ type: "set", path: "products", documentId: "a", data: { x: 1 } }]);
});

// Filters took only scalars and arrays, so a date or a reference could not be filtered on.

test("list_documents passes a date or reference filter in the wire format", async () => {
    const calls = [];
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerDocumentTools(server, { listDocuments: async (projectId, body) => { calls.push(body); return { documents: [], hasMore: false }; } });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test-client", version: "0.0.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const filters = [
        { field: "published", op: ">=", value: { _seconds: 1700000000, _nanoseconds: 0 } },
        { field: "author", op: "==", value: { _ref: "authors/bob" } },
    ];
    const result = await client.callTool({ name: "list_documents", arguments: { projectId: "p", collectionPath: "posts", filters } });
    assert.equal(result.isError, undefined, result.content?.[0]?.text);
    assert.deepEqual(calls[0].filters, filters);
    await client.close();
});

// The backend answers 200 with the operations that failed; import_documents said
// "Successfully imported N document(s)" all the same.

async function importTool(result) {
    const { registerImportTools } = await import("../dist/tools/import.js");
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerImportTools(server, { assertAdmin: async () => {}, importDocuments: async () => result });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test-client", version: "0.0.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    return client;
}

test("import_documents reports the documents that failed, once each", async () => {
    const client = await importTool({
        totalOperations: 3, batchesCompleted: 0, totalBatches: 1,
        failures: [
            { index: 1, error: "Value for argument \"documentPath\" must point to a document" },
            { index: 1, error: "Batch commit failed" },
            { index: 2, error: "Batch commit failed" },
        ],
    });
    const result = await client.callTool({
        name: "import_documents",
        arguments: { projectId: "p", collectionPath: "posts", documents: [{ id: "a", data: {} }, { id: "b", data: { author: { _ref: "authors" } } }, { data: {} }] },
    });
    assert.equal(result.isError, true);
    const text = result.content[0].text;
    assert.match(text, /Imported 1 of 3 document\(s\) into "posts"; 2 failed/);
    assert.match(text, /"b": Value for argument "documentPath"/);
    assert.match(text, /document #3 \(no id\): Batch commit failed/);
    await client.close();
});

test("import_documents still says so when everything was imported", async () => {
    const client = await importTool({ totalOperations: 1, batchesCompleted: 1, totalBatches: 1, failures: [] });
    const result = await client.callTool({
        name: "import_documents",
        arguments: { projectId: "p", collectionPath: "posts", documents: [{ id: "a", data: {} }] },
    });
    assert.equal(result.isError, undefined);
    assert.match(result.content[0].text, /^Successfully imported 1 document\(s\)/);
    await client.close();
});
