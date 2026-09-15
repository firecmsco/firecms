import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

/**
 * `ora` and `open` (which auth.ts imports) are ESM-only, so this CommonJS test run cannot
 * load them. A mock factory never loads the real module, so the spinner and the whole auth
 * module are replaced, and axios is stubbed so nothing touches the network.
 */
jest.mock("ora", () => ({
    __esModule: true,
    default: () => ({
        start() {
            return this;
        },
        succeed: () => undefined,
        fail: () => undefined
    })
}));
jest.mock("axios", () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock("../src/commands/auth", () => ({
    getCurrentUser: jest.fn(),
    getTokens: jest.fn(),
    refreshCredentials: jest.fn()
}));

import axios from "axios";
import { refreshCredentials } from "../src/commands/auth";
import { uploadZip } from "../src/commands/deploy";

const post = axios.post as jest.MockedFunction<typeof axios.post>;
const refresh = refreshCredentials as jest.MockedFunction<typeof refreshCredentials>;

const ZIP = path.join(os.tmpdir(), `firecms_deploy_test_${process.pid}.zip`);

describe("uploadZip", () => {

    let output: string[];
    let spies: Array<{ mockRestore(): void }>;

    /** Everything the command printed, without colour codes. */
    const printed = () => output.join("\n");

    beforeAll(() => fs.writeFileSync(ZIP, "not really a zip"));
    afterAll(() => fs.rmSync(ZIP, { force: true }));

    beforeEach(() => {
        jest.clearAllMocks();
        output = [];
        const capture = (...args: unknown[]) => {
            output.push(args.map(String).join(" ").replace(/\[[0-9;]*m/g, ""));
        };
        spies = [
            jest.spyOn(console, "log").mockImplementation(capture),
            jest.spyOn(console, "error").mockImplementation(capture)
        ];
        process.exitCode = undefined;
    });

    afterEach(() => {
        spies.forEach(spy => spy.mockRestore());
        // Setting this in a test would otherwise fail the whole jest run.
        process.exitCode = undefined;
    });

    it("stops before uploading when the saved login could not be refreshed", async () => {
        // The case seen on 2026-09-15: an expired staging login, where refreshCredentials
        // logs out and returns null, and deploy then crashed reading `access_token` of null.
        refresh.mockResolvedValueOnce(null);

        await expect(uploadZip("my-project", ZIP, null, "dev", false)).resolves.toBeUndefined();

        expect(post).not.toHaveBeenCalled();
        expect(printed()).toContain("Deploy failed: your saved login could not be refreshed. Run firecms login --env=dev, then deploy again.");
        expect(process.exitCode).toBe(1);
    });

    it("says plain `firecms login` for prod", async () => {
        refresh.mockResolvedValueOnce(null);

        await uploadZip("my-project", ZIP, null, "prod", false);

        expect(printed()).toContain("Run firecms login, then deploy again.");
        expect(printed()).not.toContain("--env=dev");
        expect(process.exitCode).toBe(1);
    });

    it("reports a request that failed without a response instead of crashing", async () => {
        refresh.mockResolvedValueOnce({ access_token: "token" });
        post.mockRejectedValueOnce(new Error("getaddrinfo ENOTFOUND api.firecms.co"));

        await expect(uploadZip("my-project", ZIP, null, "dev", false)).resolves.toBeUndefined();

        expect(printed()).toContain("There was an error uploading the build: getaddrinfo ENOTFOUND api.firecms.co");
        expect(printed()).not.toContain("firecms login");
        expect(process.exitCode).toBe(1);
    });

    it("prints the status and body of an error response", async () => {
        refresh.mockResolvedValueOnce({ access_token: "token" });
        post.mockRejectedValueOnce(Object.assign(new Error("Request failed with status code 500"), {
            response: { status: 500, data: { message: "Error uploading config", code: "internal-error" } }
        }));

        await uploadZip("my-project", ZIP, null, "dev", false);

        expect(printed()).toContain("There was an error uploading the build: HTTP 500: { message: 'Error uploading config', code: 'internal-error' }");
        expect(printed()).not.toContain("firecms login");
        expect(process.exitCode).toBe(1);
    });

    it("tells the user to log out and back in to dev when the API rejects the login", async () => {
        refresh.mockResolvedValueOnce({ access_token: "revoked" });
        post.mockRejectedValueOnce(Object.assign(new Error("Request failed with status code 401"), {
            response: { status: 401, data: { message: "Google Cloud token has expired", code: "google-cloud-token-expired" } }
        }));

        await uploadZip("my-project", ZIP, null, "dev", false);

        expect(printed()).toContain("HTTP 401: { message: 'Google Cloud token has expired'");
        expect(printed()).toContain("Run firecms logout --env=dev, then firecms login --env=dev, and deploy again.");
        expect(process.exitCode).toBe(1);
    });

    it("leaves the exit code alone when the upload succeeds", async () => {
        refresh.mockResolvedValueOnce({ access_token: "token" });
        post.mockResolvedValueOnce({ status: 200, data: {} });

        await uploadZip("my-project", ZIP, null, "prod", false);

        expect(post.mock.calls[0][0]).toEqual("https://api.firecms.co/projects/my-project/upload_config");
        expect(printed()).toContain("Successfully uploaded new build");
        expect(process.exitCode).toBeUndefined();
    });

});
