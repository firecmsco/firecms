import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { handleHostedMcpRequest } from "../dist/hosted.js";
import { createFireCMSMcpServer } from "../dist/server.js";
import { createFireCMSMcpServer as createLocalServer } from "../dist/index.js";
import { registerAuthTools } from "../dist/tools/auth.js";

const APP_URL = "https://app.example.test";

/** The tools that act on Google Cloud as the user, which the hosted server cannot. */
const GOOGLE_CLOUD_TOOLS = [
    "list_firebase_projects",
    "get_project_setup_status",
    "list_firestore_locations",
    "enable_project_apis",
    "enable_firestore",
];

function sessionFor(name) {
    return {
        email: async () => `${name}@example.test`,
        backendIdToken: async () => `id-token-${name}`,
        googleAccessToken: async () => undefined,
    };
}

function listen(server) {
    return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
}

function readJson(request) {
    return new Promise((resolve, reject) => {
        let raw = "";
        request.on("data", (chunk) => raw += chunk);
        request.on("end", () => {
            try {
                resolve(raw ? JSON.parse(raw) : undefined);
            } catch (error) {
                reject(error);
            }
        });
    });
}

/**
 * A stand-in for the FireCMS backend that records the headers each call arrived with.
 */
async function fakeBackend() {
    const seen = [];
    const server = http.createServer((request, response) => {
        seen.push({
            path: request.url,
            authorization: request.headers["authorization"],
            admin: request.headers["x-admin-authorization"],
        });
        response.setHeader("Content-Type", "application/json");
        if (request.url === "/projects") {
            const who = request.headers["authorization"];
            response.end(JSON.stringify({
                data: [{ id: `project-of-${who}`, name: "Shop", service_account: "SECRET" }],
            }));
            return;
        }
        response.statusCode = 404;
        response.end(JSON.stringify({ message: "not found" }));
    });
    const port = await listen(server);
    return { url: `http://127.0.0.1:${port}`, seen, close: () => server.close() };
}

/**
 * The hosted endpoint as the backend mounts it, with its bearer check reduced to
 * "the token is the user's name".
 */
async function hostedEndpoint(apiUrl) {
    const server = http.createServer(async (request, response) => {
        const name = (request.headers["authorization"] ?? "").replace(/^Bearer /, "");
        if (!name) {
            response.statusCode = 401;
            response.end();
            return;
        }
        const body = await readJson(request);
        await handleHostedMcpRequest(request, response, {
            session: sessionFor(name),
            apiUrl,
            appUrl: APP_URL,
            body,
        });
    });
    const port = await listen(server);
    return { url: new URL(`http://127.0.0.1:${port}/mcp`), close: () => server.close() };
}

async function connectOverHttp(url, name) {
    const client = new Client({ name: "test-client", version: "0.0.0" });
    const transport = new StreamableHTTPClientTransport(url, {
        requestInit: { headers: { Authorization: `Bearer ${name}` } },
    });
    await client.connect(transport);
    return client;
}

async function connectInMemory(server) {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test-client", version: "0.0.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    return client;
}

test("two people on the hosted endpoint at once each reach the backend as themselves", async () => {
    const backend = await fakeBackend();
    const endpoint = await hostedEndpoint(backend.url);
    try {
        const [alice, bob] = await Promise.all([
            connectOverHttp(endpoint.url, "alice"),
            connectOverHttp(endpoint.url, "bob"),
        ]);
        const [aliceProjects, bobProjects] = await Promise.all([
            alice.callTool({ name: "list_projects", arguments: {} }),
            bob.callTool({ name: "list_projects", arguments: {} }),
        ]);

        const aliceText = aliceProjects.content[0].text;
        const bobText = bobProjects.content[0].text;
        assert.match(aliceText, /project-of-Bearer id-token-alice/);
        assert.match(bobText, /project-of-Bearer id-token-bob/);
        assert.doesNotMatch(aliceText, /SECRET/, "the project's service account never reaches the model");

        const projectCalls = backend.seen.filter((call) => call.path === "/projects");
        assert.deepEqual(
            projectCalls.map((call) => call.authorization).sort(),
            ["Bearer id-token-alice", "Bearer id-token-bob"]
        );
        assert.ok(projectCalls.every((call) => call.admin === undefined),
            "a hosted session sends no Google Cloud token");

        await Promise.all([alice.close(), bob.close()]);
    } finally {
        endpoint.close();
        backend.close();
    }
});

test("the hosted server offers no Google Cloud or login tools, and links to the web app to connect", async () => {
    const client = await connectInMemory(createFireCMSMcpServer({
        session: sessionFor("alice"), mode: "hosted", apiUrl: "http://127.0.0.1:1", appUrl: APP_URL,
    }));
    const names = (await client.listTools()).tools.map((tool) => tool.name);

    for (const name of [...GOOGLE_CLOUD_TOOLS, "firecms_login", "firecms_logout"]) {
        assert.ok(!names.includes(name), `${name} is not offered`);
    }
    for (const name of ["connect_project_to_firecms", "apply_firestore_security_rules", "list_projects", "firecms_get_current_user"]) {
        assert.ok(names.includes(name), `${name} is offered`);
    }

    const connect = await client.callTool({ name: "connect_project_to_firecms", arguments: { projectId: "shop-prod" } });
    assert.ok(!connect.isError);
    assert.match(connect.content[0].text, new RegExp(`${APP_URL}/new`));
    assert.match(connect.content[0].text, /"shop-prod"/);

    const me = await client.callTool({ name: "firecms_get_current_user", arguments: {} });
    assert.equal(me.content[0].text, "Logged in as: alice@example.test");
    await client.close();
});

test("every tool, local or hosted, has a title and says whether it changes anything", async () => {
    const local = createFireCMSMcpServer({ session: sessionFor("alice"), apiUrl: "http://127.0.0.1:1" });
    registerAuthTools(local);
    const hosted = createFireCMSMcpServer({
        session: sessionFor("alice"), mode: "hosted", apiUrl: "http://127.0.0.1:1", appUrl: APP_URL,
    });

    for (const server of [local, hosted]) {
        const client = await connectInMemory(server);
        const { tools } = await client.listTools();
        assert.ok(tools.length > 20);
        for (const tool of tools) {
            assert.ok(tool.title, `${tool.name} has a title`);
            assert.equal(typeof tool.annotations?.readOnlyHint, "boolean", `${tool.name} sets readOnlyHint`);
            if (!tool.annotations.readOnlyHint) {
                assert.equal(typeof tool.annotations.destructiveHint, "boolean", `${tool.name} sets destructiveHint`);
            }
        }
        await client.close();
    }
});

test("a local session lists projects with its Google token alone, as 3.4 did", async () => {
    const backend = await fakeBackend();
    try {
        const client = await connectInMemory(createFireCMSMcpServer({
            session: {
                email: async () => "local@example.test",
                backendIdToken: async () => { throw new Error("no Firebase exchange needed to list projects"); },
                googleAccessToken: async () => "google-token",
            },
            apiUrl: backend.url,
        }));
        const result = await client.callTool({ name: "list_projects", arguments: {} });
        assert.ok(!result.isError, result.content[0].text);
        assert.deepEqual(backend.seen, [{ path: "/projects", authorization: undefined, admin: "Bearer google-token" }]);
        await client.close();
    } finally {
        backend.close();
    }
});

test("createFireCMSMcpServer() with no options is still the local server, login tools included", async () => {
    // What the CLI calls, and what 3.4 callers of the package called.
    const client = await connectInMemory(createLocalServer());
    const names = (await client.listTools()).tools.map((tool) => tool.name);
    for (const name of [...GOOGLE_CLOUD_TOOLS, "connect_project_to_firecms", "firecms_login", "firecms_logout"]) {
        assert.ok(names.includes(name), `${name} is offered`);
    }
    await client.close();
});

test("the hosted entry point never loads the CLI's login flow or the local token file", () => {
    const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
    const visited = new Set();
    const packages = new Set();
    const visit = (file) => {
        if (visited.has(file)) return;
        visited.add(file);
        const source = fs.readFileSync(file, "utf-8");
        for (const [, specifier] of source.matchAll(/(?:import|export)[^'"]*?from\s+["']([^"']+)["']/g)) {
            if (specifier.startsWith(".")) {
                visit(path.resolve(path.dirname(file), specifier));
            } else {
                packages.add(specifier);
            }
        }
    };
    visit(path.join(dist, "hosted.js"));

    const loaded = [...visited].map((file) => path.relative(dist, file));
    assert.ok(!loaded.includes("auth.js") && !loaded.includes("local-session.js") && !loaded.includes("backend-auth.js"),
        `hosted.js reaches ${loaded.join(", ")}`);
    assert.ok(![...packages].some((name) => name.startsWith("@firecms/cli")),
        `hosted.js imports ${[...packages].join(", ")}`);
});
