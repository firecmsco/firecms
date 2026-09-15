import { describe, expect, it } from "@jest/globals";
import { authCommand, describeRequestError, isLoginRejected } from "../src/util/request_error";

describe("describeRequestError", () => {

    it("gives the status and body when the server answered", () => {
        const err = Object.assign(new Error("Request failed with status code 401"), {
            response: {
                status: 401,
                statusText: "Unauthorized",
                data: { message: "Google Cloud token has expired", code: "google-cloud-token-expired" }
            }
        });
        expect(describeRequestError(err)).toEqual(
            "HTTP 401 Unauthorized: { message: 'Google Cloud token has expired', code: 'google-cloud-token-expired' }"
        );
    });

    it("gives a text body as it is, and just the status when there is no body", () => {
        expect(describeRequestError({ response: { status: 502, data: "Bad Gateway\n" } })).toEqual("HTTP 502: Bad Gateway");
        expect(describeRequestError({ response: { status: 503, data: "" } })).toEqual("HTTP 503");
        expect(describeRequestError({ response: { status: 504 } })).toEqual("HTTP 504");
    });

    it("gives the error message when there is no response", () => {
        // What deploy used to crash on with "Cannot read properties of undefined (reading 'data')".
        expect(describeRequestError(new Error("getaddrinfo ENOTFOUND api.firecms.co"))).toEqual("getaddrinfo ENOTFOUND api.firecms.co");
        expect(describeRequestError(new TypeError("Cannot read properties of null (reading 'access_token')")))
            .toEqual("Cannot read properties of null (reading 'access_token')");
    });

    it("falls back to the code or name when the message is empty", () => {
        expect(describeRequestError(Object.assign(new AggregateError([], ""), { code: "ECONNREFUSED" }))).toEqual("ECONNREFUSED");
        expect(describeRequestError(new AggregateError([], ""))).toEqual("AggregateError");
    });

    it("copes with things thrown that are not errors", () => {
        expect(describeRequestError("boom")).toEqual("boom");
        expect(describeRequestError(undefined)).toEqual("undefined");
        expect(describeRequestError(null)).toEqual("null");
    });

});

describe("isLoginRejected", () => {

    it("is true only for a 401 response", () => {
        expect(isLoginRejected({ response: { status: 401 } })).toBe(true);
        expect(isLoginRejected({ response: { status: 403 } })).toBe(false);
        expect(isLoginRejected({ response: { status: 500 } })).toBe(false);
        expect(isLoginRejected(new Error("socket hang up"))).toBe(false);
        expect(isLoginRejected(undefined)).toBe(false);
    });

});

describe("authCommand", () => {

    it("adds --env=dev only for dev", () => {
        expect(authCommand("login", "prod")).toEqual("firecms login");
        expect(authCommand("login", "dev")).toEqual("firecms login --env=dev");
        expect(authCommand("logout", "dev")).toEqual("firecms logout --env=dev");
    });

});
