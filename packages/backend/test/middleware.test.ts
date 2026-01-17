import { Request, Response } from "express";
import { requireAuth, optionalAuth, extractUserFromToken, AuthenticatedRequest } from "../src/auth/middleware";
import { configureJwt, generateAccessToken } from "../src/auth/jwt";

describe("Auth Middleware", () => {
    const testSecret = "test-secret-key-for-middleware-testing";
    let mockReq: Partial<AuthenticatedRequest>;
    let mockRes: Partial<Response>;
    let nextFn: jest.Mock;
    let jsonFn: jest.Mock;
    let statusFn: jest.Mock;

    beforeAll(() => {
        configureJwt({
            secret: testSecret,
            accessExpiresIn: "1h",
            refreshExpiresIn: "30d"
        });
    });

    beforeEach(() => {
        jsonFn = jest.fn();
        statusFn = jest.fn().mockReturnValue({ json: jsonFn });
        mockRes = {
            status: statusFn,
            json: jsonFn
        };
        mockReq = {
            headers: {}
        };
        nextFn = jest.fn();
    });

    describe("requireAuth", () => {
        it("should call next() and set user for valid token", () => {
            const token = generateAccessToken("user-123", ["admin", "editor"]);
            mockReq.headers = { authorization: `Bearer ${token}` };

            requireAuth(mockReq as Request, mockRes as Response, nextFn);

            expect(nextFn).toHaveBeenCalled();
            expect(mockReq.user).toEqual({
                userId: "user-123",
                roles: ["admin", "editor"]
            });
            expect(statusFn).not.toHaveBeenCalled();
        });

        it("should return 401 for missing Authorization header", () => {
            mockReq.headers = {};

            requireAuth(mockReq as Request, mockRes as Response, nextFn);

            expect(statusFn).toHaveBeenCalledWith(401);
            expect(jsonFn).toHaveBeenCalledWith({
                error: {
                    message: "Authorization header missing or invalid",
                    code: "UNAUTHORIZED"
                }
            });
            expect(nextFn).not.toHaveBeenCalled();
        });

        it("should return 401 for Authorization header without Bearer prefix", () => {
            mockReq.headers = { authorization: "token-without-bearer" };

            requireAuth(mockReq as Request, mockRes as Response, nextFn);

            expect(statusFn).toHaveBeenCalledWith(401);
            expect(jsonFn).toHaveBeenCalledWith({
                error: {
                    message: "Authorization header missing or invalid",
                    code: "UNAUTHORIZED"
                }
            });
            expect(nextFn).not.toHaveBeenCalled();
        });

        it("should return 401 for invalid token", () => {
            mockReq.headers = { authorization: "Bearer invalid-token" };

            requireAuth(mockReq as Request, mockRes as Response, nextFn);

            expect(statusFn).toHaveBeenCalledWith(401);
            expect(jsonFn).toHaveBeenCalledWith({
                error: {
                    message: "Invalid or expired token",
                    code: "UNAUTHORIZED"
                }
            });
            expect(nextFn).not.toHaveBeenCalled();
        });

        it("should return 401 for token signed with different secret", () => {
            const token = generateAccessToken("user-123", ["admin"]);
            // Reconfigure with different secret
            configureJwt({ secret: "different-secret" });
            mockReq.headers = { authorization: `Bearer ${token}` };

            requireAuth(mockReq as Request, mockRes as Response, nextFn);

            expect(statusFn).toHaveBeenCalledWith(401);
            expect(nextFn).not.toHaveBeenCalled();

            // Reset to original secret for other tests
            configureJwt({ secret: testSecret });
        });

        it("should handle lowercase bearer prefix", () => {
            const token = generateAccessToken("user-123", ["admin"]);
            mockReq.headers = { authorization: `bearer ${token}` };

            requireAuth(mockReq as Request, mockRes as Response, nextFn);

            // The implementation requires "Bearer " with capital B
            expect(statusFn).toHaveBeenCalledWith(401);
            expect(nextFn).not.toHaveBeenCalled();
        });
    });

    describe("optionalAuth", () => {
        it("should set user for valid token", () => {
            const token = generateAccessToken("user-456", ["viewer"]);
            mockReq.headers = { authorization: `Bearer ${token}` };

            optionalAuth(mockReq as Request, mockRes as Response, nextFn);

            expect(nextFn).toHaveBeenCalled();
            expect(mockReq.user).toEqual({
                userId: "user-456",
                roles: ["viewer"]
            });
        });

        it("should call next() without setting user when no token provided", () => {
            mockReq.headers = {};

            optionalAuth(mockReq as Request, mockRes as Response, nextFn);

            expect(nextFn).toHaveBeenCalled();
            expect(mockReq.user).toBeUndefined();
            expect(statusFn).not.toHaveBeenCalled();
        });

        it("should call next() without setting user for invalid token", () => {
            mockReq.headers = { authorization: "Bearer invalid-token" };

            optionalAuth(mockReq as Request, mockRes as Response, nextFn);

            expect(nextFn).toHaveBeenCalled();
            expect(mockReq.user).toBeUndefined();
            expect(statusFn).not.toHaveBeenCalled();
        });

        it("should call next() without setting user for non-Bearer auth", () => {
            mockReq.headers = { authorization: "Basic dXNlcjpwYXNz" };

            optionalAuth(mockReq as Request, mockRes as Response, nextFn);

            expect(nextFn).toHaveBeenCalled();
            expect(mockReq.user).toBeUndefined();
        });
    });

    describe("extractUserFromToken", () => {
        it("should extract user from valid token", () => {
            const token = generateAccessToken("ws-user-123", ["admin"]);
            const payload = extractUserFromToken(token);

            expect(payload).toEqual({
                userId: "ws-user-123",
                roles: ["admin"]
            });
        });

        it("should return null for invalid token", () => {
            const payload = extractUserFromToken("invalid-token");
            expect(payload).toBeNull();
        });

        it("should return null for empty token", () => {
            const payload = extractUserFromToken("");
            expect(payload).toBeNull();
        });

        it("should work with tokens having empty roles", () => {
            const token = generateAccessToken("user-no-roles", []);
            const payload = extractUserFromToken(token);

            expect(payload).toEqual({
                userId: "user-no-roles",
                roles: []
            });
        });
    });
});
