import test from "node:test";
import assert from "node:assert/strict";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import { registerOnboardingTools } from "../dist/tools/onboarding.js";

/**
 * Spin up the real tool handlers over an in-memory transport, backed by whatever
 * stand-in for the API client the test needs. No network, but the handlers, their
 * schemas and their responses are the shipped ones.
 */
async function withTools(api) {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    registerOnboardingTools(server, api);

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

const READY = { firebaseEnabled: true, firestoreEnabled: true, apisEnabled: true, authEnabled: true };

/** A connectable project whose rules call succeeds, recording the calls made. */
function connectable() {
    const calls = { connected: null, rulesFor: [] };
    return {
        calls,
        api: {
            getProjectSetupStatus: async () => READY,
            connectProject: async (projectId, creationType) => { calls.connected = { projectId, creationType }; return { message: "Ok" }; },
            applySecurityRules: async (projectId) => { calls.rulesFor.push(projectId); return { message: "Ok" }; }
        }
    };
}

test("connect refuses when Firebase Authentication is off, and explains why", async () => {
    // The backend otherwise retries eight times and fails with "Unable to initialize
    // delegated Firebase app", which never mentions Authentication.
    let connectCalled = false;
    const { call, close } = await withTools({
        getProjectSetupStatus: async () => ({ ...READY, authEnabled: false }),
        connectProject: async () => { connectCalled = true; return {}; }
    });

    const res = await call("connect_project_to_firecms", { projectId: "boda-ale-fra" });

    assert.equal(res.isError, true);
    assert.match(res.text, /Authentication is not enabled/i);
    assert.match(res.text, /console\.firebase\.google\.com\/project\/boda-ale-fra\/authentication/);
    assert.equal(connectCalled, false, "must not attempt the connect");
    assert.match(res.text, /Nothing has been changed/i);
    await close();
});

test("connect proceeds when Authentication is enabled", async () => {
    let seen;
    const { call, close } = await withTools({
        getProjectSetupStatus: async () => READY,
        connectProject: async (projectId, creationType) => { seen = { projectId, creationType }; return { message: "Ok" }; },
        applySecurityRules: async () => ({ message: "Ok" })
    });

    const res = await call("connect_project_to_firecms", { projectId: "some-project" });

    assert.equal(res.isError, false);
    assert.deepEqual(seen, { projectId: "some-project", creationType: "existing" });
    await close();
});

test("the creationType argument is passed through", async () => {
    let seen;
    const { call, close } = await withTools({
        getProjectSetupStatus: async () => READY,
        connectProject: async (projectId, creationType) => { seen = creationType; return {}; },
        applySecurityRules: async () => ({ message: "Ok" })
    });

    await call("connect_project_to_firecms", { projectId: "p", creationType: "new" });

    assert.equal(seen, "new");
    await close();
});

test("an unreadable status does not block the connect", async () => {
    // The check is advisory. A project the status endpoint cannot describe should
    // still be connectable — the connect itself is the authority.
    let connectCalled = false;
    const { call, close } = await withTools({
        getProjectSetupStatus: async () => { throw new Error("status unavailable"); },
        connectProject: async () => { connectCalled = true; return {}; },
        applySecurityRules: async () => ({ message: "Ok" })
    });

    const res = await call("connect_project_to_firecms", { projectId: "p" });

    assert.equal(connectCalled, true);
    assert.equal(res.isError, false);
    await close();
});

test("a status that omits authEnabled does not block the connect", async () => {
    let connectCalled = false;
    const { call, close } = await withTools({
        getProjectSetupStatus: async () => ({ firebaseEnabled: true }),
        connectProject: async () => { connectCalled = true; return {}; },
        applySecurityRules: async () => ({ message: "Ok" })
    });

    await call("connect_project_to_firecms", { projectId: "p" });

    assert.equal(connectCalled, true);
    await close();
});

test("an already-connected project is explained, not just refused", async () => {
    const { call, close } = await withTools({
        getProjectSetupStatus: async () => READY,
        connectProject: async () => {
            const e = new Error("Request failed");
            e.response = { status: 400, data: { code: "firecms-project-already-exists", message: "Project already exists" } };
            throw e;
        }
    });

    const res = await call("connect_project_to_firecms", { projectId: "p" });

    assert.equal(res.isError, true);
    assert.match(res.text, /already connected/i);
    assert.match(res.text, /list_projects/);
    await close();
});

test("the opaque delegated-app failure names Authentication as the likely cause", async () => {
    const { call, close } = await withTools({
        getProjectSetupStatus: async () => READY,
        connectProject: async () => {
            const e = new Error("Request failed");
            e.response = {
                status: 500,
                data: {
                    code: "delegated-firebase-app-initialization-failed",
                    message: "Unable to initialize delegated Firebase app for project p after 8 attempts"
                }
            };
            throw e;
        }
    });

    const res = await call("connect_project_to_firecms", { projectId: "p" });

    assert.equal(res.isError, true);
    assert.match(res.text, /auth\/configuration-not-found|Authentication is not enabled/i);
    await close();
});

test("the connect tool warns about Authentication in its description", async () => {
    const { client, close } = await withTools({});
    const { tools } = await client.listTools();
    const connect = tools.find(t => t.name === "connect_project_to_firecms");

    assert.ok(connect, "connect_project_to_firecms should be registered");
    assert.match(connect.description, /Authentication/);
    assert.match(connect.description, /cannot be enabled through any API/i);
    await close();
});

test("connecting applies the access rule, as the web creation flow does", async () => {
    // Without it the CMS shows "Missing Firestore Security Rules" and opens nothing.
    // Nothing downstream would catch it: these tools read through the backend's
    // service account, which bypasses security rules, so every tool would report
    // success while the CMS stayed broken for the person using it.
    const { calls, api } = connectable();
    const { call, close } = await withTools(api);

    const res = await call("connect_project_to_firecms", { projectId: "boda-ale-fra" });

    assert.deepEqual(calls.rulesFor, ["boda-ale-fra"]);
    assert.equal(res.isError, false);
    assert.match(res.text, /security rules/i);
    await close();
});

test("the rules step can be declined explicitly", async () => {
    const { calls, api } = connectable();
    const { call, close } = await withTools(api);

    const res = await call("connect_project_to_firecms", { projectId: "p", applySecurityRules: false });

    assert.deepEqual(calls.rulesFor, [], "must not touch security rules when declined");
    assert.equal(res.isError, false);
    assert.match(res.text, /apply_firestore_security_rules/);
    await close();
});

test("a failed rules step does not fail the connect, but says what to do", async () => {
    // The project genuinely is connected at that point; losing that fact would be
    // worse than reporting a follow-up step.
    const { call, close } = await withTools({
        getProjectSetupStatus: async () => READY,
        connectProject: async () => ({ message: "Ok" }),
        applySecurityRules: async () => {
            const e = new Error("Request failed");
            e.response = { status: 403, data: { message: "Missing permission on the project" } };
            throw e;
        }
    });

    const res = await call("connect_project_to_firecms", { projectId: "p" });

    assert.equal(res.isError, false, "the project is connected; that must be reported");
    assert.match(res.text, /now connected/i);
    assert.match(res.text, /Missing permission on the project/);
    assert.match(res.text, /apply_firestore_security_rules/);
    await close();
});

test("apply_firestore_security_rules applies them on demand", async () => {
    const seen = [];
    const { call, close } = await withTools({ applySecurityRules: async (p) => { seen.push(p); return {}; } });

    const res = await call("apply_firestore_security_rules", { projectId: "boda-ale-fra" });

    assert.deepEqual(seen, ["boda-ale-fra"]);
    assert.equal(res.isError, false);
    assert.match(res.text, /already there were kept|kept/i);
    await close();
});

test("a failure points at the console as a manual fallback", async () => {
    const { call, close } = await withTools({
        applySecurityRules: async () => {
            const e = new Error("Request failed");
            e.response = { status: 500, data: { message: "rules API unavailable" } };
            throw e;
        }
    });

    const res = await call("apply_firestore_security_rules", { projectId: "p" });

    assert.equal(res.isError, true);
    assert.match(res.text, /rules API unavailable/);
    assert.match(res.text, /console\.firebase\.google\.com\/project\/p\/firestore\/rules/);
    await close();
});

test("the rules tool explains that these tools would not notice the problem", async () => {
    const { client, close } = await withTools({});
    const { tools } = await client.listTools();
    const tool = tools.find(t => t.name === "apply_firestore_security_rules");

    assert.ok(tool);
    assert.match(tool.description, /fireCMSUser/);
    assert.match(tool.description, /bypasses security rules/i);
    await close();
});

test("every onboarding tool is registered", async () => {
    const { client, close } = await withTools({});
    const { tools } = await client.listTools();
    const names = tools.map(t => t.name).sort();

    assert.deepEqual(names, [
        "apply_firestore_security_rules",
        "connect_project_to_firecms",
        "create_firecms_webapp",
        "enable_firestore",
        "enable_project_apis",
        "get_project_setup_status",
        "list_firebase_projects",
        "list_firestore_locations"
    ]);
    await close();
});

test("enable_firestore requires a location, which is permanent", async () => {
    const { client, call, close } = await withTools({
        enableFirestore: async (projectId, locationId) => ({ projectId, locationId })
    });
    const { tools } = await client.listTools();
    const tool = tools.find(t => t.name === "enable_firestore");

    assert.ok(tool.inputSchema.required.includes("locationId"));
    assert.match(tool.description, /permanent/i);

    const res = await call("enable_firestore", { projectId: "p", locationId: "eur3" });
    assert.equal(res.isError, false);
    assert.match(res.text, /eur3/);
    await close();
});
