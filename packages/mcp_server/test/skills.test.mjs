import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { SkillsClient } from "@modelcontextprotocol/client/ext/skills";
import { InMemoryTransport } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";

import { handleHostedMcpRequest } from "../dist/hosted.js";
import { createFireCMSMcpServer } from "../dist/server.js";
import { agentSkillsDir, createFireCMSMcpServer as createLocalServer, loadFireCMSSkills } from "../dist/index.js";
import { registerAuthTools } from "../dist/tools/auth.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_SKILLS = path.join(here, "fixtures", "skills");
const FIXTURE_SKILL = path.join(FIXTURE_SKILLS, "firecms-fixture");
/** `tools/list` as `@modelcontextprotocol/sdk` 1.32 answered it, captured before the move to SDK 2. */
const TOOLS_LIST_SDK1 = JSON.parse(fs.readFileSync(path.join(here, "fixtures", "tools-list.sdk1.json"), "utf-8"));

const MODERN = "2026-07-28";
const LEGACY = "2025-11-25";
const APP_URL = "https://app.example.test";

function sessionFor(name) {
    return {
        email: async () => `${name}@example.test`,
        backendIdToken: async () => `id-token-${name}`,
        googleAccessToken: async () => undefined,
    };
}

const sha256 = (bytes) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;

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
 * The hosted endpoint as the backend mounts it: bearer = the user's name, body parsed
 * (as express.json() does), or left in the stream with `unparsed`.
 */
async function hostedEndpoint({ unparsed = false, ...options }) {
    const server = http.createServer(async (request, response) => {
        const name = (request.headers["authorization"] ?? "").replace(/^Bearer /, "") || "anonymous";
        await handleHostedMcpRequest(request, response, {
            session: sessionFor(name),
            apiUrl: "http://127.0.0.1:1",
            appUrl: APP_URL,
            body: unparsed ? undefined : await readJson(request),
            ...options,
        });
    });
    const port = await listen(server);
    return { url: new URL(`http://127.0.0.1:${port}/mcp`), close: () => server.close() };
}

function clientFor(era) {
    return new Client(
        { name: "test-client", version: "0.0.0" },
        era === "modern" ? { versionNegotiation: { mode: "auto" } } : {}
    );
}

async function connectOverHttp(url, era) {
    const client = clientFor(era);
    await client.connect(new StreamableHTTPClientTransport(url, {
        requestInit: { headers: { Authorization: "Bearer alice" } },
    }));
    return client;
}

/**
 * The stdio server as `firecms-mcp` runs it — `serveStdio` over a factory, deciding the
 * era from the client's opening message — with an in-memory pipe in place of stdin/stdout.
 */
async function connectOverStdio(factory, era) {
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    const handle = serveStdio(factory, { transport: serverSide });
    const client = clientFor(era);
    await client.connect(clientSide);
    return { client, close: async () => { await client.close(); await handle.close(); } };
}

/** Lists the fixture skill and reads both of its files, checking each against the catalog's digest. */
async function assertServesFixtureSkill(client) {
    const skills = new SkillsClient(client);
    assert.equal(skills.supported, true, "the server declares the skills extension");

    const listing = await skills.list();
    assert.deepEqual(listing.skills.map((skill) => skill.uri), ["skill://firecms-fixture/SKILL.md"]);
    const [entry] = listing.skills;
    assert.equal(entry.frontmatter.name, "firecms-fixture");

    const fetched = await skills.get(entry.uri);
    assert.deepEqual(fetched.skill, entry);

    for (const file of ["SKILL.md", "references/notes.md"]) {
        const onDisk = fs.readFileSync(path.join(FIXTURE_SKILL, file));
        const published = entry.resources.find((resource) => resource.uri === `skill://firecms-fixture/${file}`);
        assert.ok(published, `${file} is listed in the entry`);
        assert.equal(published.digest, sha256(onDisk), `${file}'s published digest is its bytes'`);

        const read = await skills.read(entry, file);
        assert.equal(read.verified, true, `${file} matched its size and digest`);
        assert.deepEqual(Buffer.from(read.bytes), onDisk);
    }
    return listing;
}

test("the skills directory is the one @firecms/agent-skills ships", () => {
    assert.equal(agentSkillsDir(), path.resolve(here, "..", "..", "agent_skills", "skills"));
});

test("a 2026-07-28 client lists and reads a skill from the stdio server", async () => {
    const skills = await loadFireCMSSkills(FIXTURE_SKILLS);
    const { client, close } = await connectOverStdio(() => createLocalServer({ skills }), "modern");
    try {
        assert.equal(client.getNegotiatedProtocolVersion(), MODERN);
        const listing = await assertServesFixtureSkill(client);
        assert.equal(listing.cacheScope, "public");

        // The tools are all still there for the same client, login tools included.
        const names = (await client.listTools()).tools.map((tool) => tool.name);
        for (const name of ["list_projects", "firecms_login", "connect_project_to_firecms"])
            assert.ok(names.includes(name), `${name} is offered`);
    } finally {
        await close();
    }
});

test("a 2026-07-28 client lists and reads a skill from the hosted endpoint", async () => {
    const endpoint = await hostedEndpoint({ skills: await loadFireCMSSkills(FIXTURE_SKILLS) });
    try {
        const client = await connectOverHttp(endpoint.url, "modern");
        assert.equal(client.getNegotiatedProtocolVersion(), MODERN);
        await assertServesFixtureSkill(client);

        const me = await client.callTool({ name: "firecms_get_current_user", arguments: {} });
        assert.equal(me.content[0].text, "Logged in as: alice@example.test", "tools act for the request's person");
        await client.close();
    } finally {
        endpoint.close();
    }
});

test("the hosted endpoint reads the body itself when no body parser ran", async () => {
    const endpoint = await hostedEndpoint({ unparsed: true, skills: await loadFireCMSSkills(FIXTURE_SKILLS) });
    try {
        for (const era of ["modern", "legacy"]) {
            const client = await connectOverHttp(endpoint.url, era);
            assert.equal(client.getNegotiatedProtocolVersion(), era === "modern" ? MODERN : LEGACY);
            const me = await client.callTool({ name: "firecms_get_current_user", arguments: {} });
            assert.equal(me.content[0].text, "Logged in as: alice@example.test");
            if (era === "modern")
                await assertServesFixtureSkill(client);
            await client.close();
        }
    } finally {
        endpoint.close();
    }
});

test("the hosted endpoint serves the shipped skills when none are given", async () => {
    // Whatever @firecms/agent-skills holds right now: the point is the default wiring.
    const shipped = await loadFireCMSSkills();
    const endpoint = await hostedEndpoint({});
    try {
        const client = await connectOverHttp(endpoint.url, "modern");
        const skills = new SkillsClient(client);
        assert.equal(skills.supported, shipped !== undefined);
        if (shipped) {
            const listed = await skills.list();
            assert.deepEqual(listed.skills.map((skill) => skill.uri), shipped.entries.map((skill) => skill.uri));
        }
        await client.close();
    } finally {
        endpoint.close();
    }
});

test("a 2025-11-25 client still gets every tool, over stdio and over HTTP", async () => {
    const skills = await loadFireCMSSkills(FIXTURE_SKILLS);
    const stdio = await connectOverStdio(() => createLocalServer({ skills }), "legacy");
    try {
        assert.equal(stdio.client.getNegotiatedProtocolVersion(), LEGACY);
        const names = (await stdio.client.listTools()).tools.map((tool) => tool.name);
        assert.deepEqual(names, TOOLS_LIST_SDK1.local.map((tool) => tool.name));
    } finally {
        await stdio.close();
    }

    const endpoint = await hostedEndpoint({ skills });
    try {
        const client = await connectOverHttp(endpoint.url, "legacy");
        assert.equal(client.getNegotiatedProtocolVersion(), LEGACY);
        const names = (await client.listTools()).tools.map((tool) => tool.name);
        assert.deepEqual(names, TOOLS_LIST_SDK1.hosted.map((tool) => tool.name));
        const me = await client.callTool({ name: "firecms_get_current_user", arguments: {} });
        assert.equal(me.content[0].text, "Logged in as: alice@example.test");
        await client.close();
    } finally {
        endpoint.close();
    }
});

/**
 * `tools/list` exactly as a 2025-era client receives it on the wire: raw JSON-RPC,
 * no client library parsing the answer.
 */
async function rawToolsList(server) {
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    await server.connect(serverSide);
    const replies = new Map();
    clientSide.onmessage = (message) => {
        if (message.id !== undefined) replies.get(message.id)?.(message);
    };
    await clientSide.start();
    const request = (id, method, params) => new Promise((resolve) => {
        replies.set(id, resolve);
        void clientSide.send({ jsonrpc: "2.0", id, method, params });
    });
    await request(1, "initialize", { protocolVersion: LEGACY, capabilities: {}, clientInfo: { name: "raw", version: "0" } });
    await clientSide.send({ jsonrpc: "2.0", method: "notifications/initialized" });
    const answer = await request(2, "tools/list", {});
    await clientSide.close();
    return answer.result.tools;
}

/**
 * SDK 1 also sent `execution: { taskSupport: "forbidden" }` on every tool. SDK 2 sends
 * nothing there: tasks left the protocol, and "forbidden" was what an absent field meant.
 */
const withoutExecution = (tools) => tools.map(({ execution, ...tool }) => tool);

test("tools/list on the wire is what SDK 1 sent, schema for schema", async () => {
    // If you changed a tool on purpose, update test/fixtures/tools-list.sdk1.json with the
    // new tool's entry as this test prints it.
    const local = createFireCMSMcpServer({ session: sessionFor("alice"), apiUrl: "http://127.0.0.1:1" });
    registerAuthTools(local);
    const hosted = createFireCMSMcpServer({
        session: sessionFor("alice"), mode: "hosted", apiUrl: "http://127.0.0.1:1", appUrl: APP_URL,
    });
    for (const [kind, server] of [["local", local], ["hosted", hosted]]) {
        const tools = await rawToolsList(server);
        const expected = withoutExecution(TOOLS_LIST_SDK1[kind]);
        assert.equal(tools.length, expected.length, `${kind}: as many tools`);
        for (const [index, tool] of tools.entries()) {
            // Byte for byte: same keys, same order, same JSON Schema dialect.
            assert.equal(JSON.stringify(tool), JSON.stringify(expected[index]), `${kind}: ${tool.name}`);
        }
    }
});

test("a 2026-07-28 client sees the same input schemas", async () => {
    const endpoint = await hostedEndpoint({});
    try {
        const client = await connectOverHttp(endpoint.url, "modern");
        const { tools } = await client.listTools();
        const expected = new Map(TOOLS_LIST_SDK1.hosted.map((tool) => [tool.name, tool.inputSchema]));
        assert.equal(tools.length, expected.size);
        for (const tool of tools)
            assert.deepEqual(tool.inputSchema, expected.get(tool.name), tool.name);
        await client.close();
    } finally {
        endpoint.close();
    }
});

test("tool arguments are still checked against the zod schemas", async () => {
    const client = new Client({ name: "test-client", version: "0.0.0" });
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    const server = createFireCMSMcpServer({ session: sessionFor("alice"), apiUrl: "http://127.0.0.1:1" });
    await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
    const result = await client.callTool({ name: "list_documents", arguments: { projectId: 42 } });
    assert.equal(result.isError, true);
    assert.match(result.content[0].text, /projectId/);
    await client.close();
});

test("without a skills directory the server starts, without skills, and says so on stderr only", async (t) => {
    const stderr = [];
    t.mock.method(process.stderr, "write", (chunk) => { stderr.push(String(chunk)); return true; });
    const missing = await loadFireCMSSkills(path.join(os.tmpdir(), "firecms-mcp-no-such-skills-dir"));
    t.mock.restoreAll();

    assert.equal(missing, undefined);
    assert.ok(stderr.some((line) => line.includes("serving without agent skills")));

    const { client, close } = await connectOverStdio(() => createLocalServer({ skills: missing }), "modern");
    try {
        assert.equal(new SkillsClient(client).supported, false);
        assert.ok((await client.listTools()).tools.length > 20);
    } finally {
        await close();
    }
});

test("an empty skills directory serves an empty catalog", async () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), "firecms-mcp-empty-skills-"));
    try {
        const skills = await loadFireCMSSkills(empty);
        const { client, close } = await connectOverStdio(() => createLocalServer({ skills }), "modern");
        try {
            const listed = skills ? (await new SkillsClient(client).list()).skills : [];
            assert.deepEqual(listed, []);
            assert.ok((await client.listTools()).tools.length > 20);
        } finally {
            await close();
        }
    } finally {
        fs.rmSync(empty, { recursive: true, force: true });
    }
});
