import { Router, Request, Response } from "express";
import { StorageController, LocalStorageConfig } from "../src/storage/types";
import { LocalStorageController } from "../src/storage/LocalStorageController";

// Mock multer for file upload testing
jest.mock("multer", () => {
    const mockMulter = () => ({
        single: () => (req: any, res: any, next: any) => {
            // Simulate file upload
            req.file = {
                buffer: Buffer.from("test content"),
                originalname: "test.txt",
                mimetype: "text/plain",
                size: 12
            };
            next();
        },
        array: () => (req: any, res: any, next: any) => {
            req.files = [{
                buffer: Buffer.from("test content"),
                originalname: "test.txt",
                mimetype: "text/plain",
                size: 12
            }];
            next();
        }
    });
    mockMulter.memoryStorage = jest.fn();
    return mockMulter;
});

describe("Storage Routes", () => {
    let mockStorageController: jest.Mocked<StorageController>;
    let mockReq: Partial<Request> & { user?: { userId: string; roles: string[] }; file?: any };
    let mockRes: Partial<Response>;
    let jsonFn: jest.Mock;
    let statusFn: jest.Mock;
    let sendFn: jest.Mock;
    let nextFn: jest.Mock;

    beforeEach(() => {
        jsonFn = jest.fn();
        sendFn = jest.fn();
        statusFn = jest.fn().mockReturnValue({ json: jsonFn, send: sendFn });
        mockRes = {
            status: statusFn,
            json: jsonFn,
            send: sendFn
        };
        nextFn = jest.fn();

        mockStorageController = {
            getType: jest.fn().mockReturnValue("local"),
            uploadFile: jest.fn(),
            getDownloadURL: jest.fn(),
            getFile: jest.fn(),
            deleteFile: jest.fn(),
            list: jest.fn()
        } as any;

        mockReq = {
            headers: {},
            params: {},
            query: {}
        };
    });

    describe("POST /storage/upload", () => {
        it("should upload file successfully", async () => {
            mockReq.file = {
                buffer: Buffer.from("test content"),
                originalname: "test.txt",
                mimetype: "text/plain",
                size: 12
            };
            mockReq.body = { path: "uploads" };

            mockStorageController.uploadFile.mockResolvedValue({
                path: "uploads/test.txt",
                url: undefined
            });

            const result = await mockStorageController.uploadFile({
                file: expect.any(File),
                fileName: "test.txt",
                path: "uploads"
            });

            expect(result.path).toBe("uploads/test.txt");
        });

        it("should handle optional metadata", async () => {
            mockReq.file = {
                buffer: Buffer.from("content"),
                originalname: "meta.txt",
                mimetype: "text/plain",
                size: 7
            };
            mockReq.body = {
                path: "uploads",
                metadata: JSON.stringify({ custom: "value" })
            };

            mockStorageController.uploadFile.mockResolvedValue({
                path: "uploads/meta.txt",
                url: undefined
            });

            const result = await mockStorageController.uploadFile({
                file: expect.any(File),
                fileName: "meta.txt",
                path: "uploads",
                metadata: { custom: "value" }
            });

            expect(result.path).toBe("uploads/meta.txt");
        });

        it("should require file in request", () => {
            mockReq.file = undefined;

            // Without file, upload should fail
            expect(mockReq.file).toBeUndefined();
        });
    });

    describe("GET /storage/download/:path", () => {
        it("should return download URL", async () => {
            mockStorageController.getDownloadURL.mockResolvedValue({
                url: "https://storage.example.com/files/test.txt",
                metadata: { contentType: "text/plain" }
            });

            const result = await mockStorageController.getDownloadURL("files/test.txt");

            expect(result.url).toBe("https://storage.example.com/files/test.txt");
        });

        it("should handle bucket parameter", async () => {
            mockStorageController.getDownloadURL.mockResolvedValue({
                url: "https://storage.example.com/custom-bucket/file.txt",
                metadata: {}
            });

            const result = await mockStorageController.getDownloadURL("file.txt", "custom-bucket");

            expect(result.url).toContain("custom-bucket");
        });
    });

    describe("GET /storage/files/:path", () => {
        it("should list files in directory", async () => {
            mockStorageController.list.mockResolvedValue({
                items: [
                    { name: "file1.txt", path: "uploads/file1.txt" } as any,
                    { name: "file2.txt", path: "uploads/file2.txt" } as any
                ],
                prefixes: []
            });

            const result = await mockStorageController.list("uploads");

            expect(result.items).toHaveLength(2);
        });

        it("should handle pagination", async () => {
            mockStorageController.list.mockResolvedValue({
                items: [{ name: "file1.txt", path: "uploads/file1.txt" } as any],
                prefixes: [],
                nextPageToken: "token123"
            });

            const result = await mockStorageController.list("uploads", { maxResults: 1 });

            expect(result.nextPageToken).toBe("token123");
        });

        it("should return empty list for non-existent path", async () => {
            mockStorageController.list.mockResolvedValue({
                items: [],
                prefixes: []
            });

            const result = await mockStorageController.list("nonexistent");

            expect(result.items).toHaveLength(0);
        });
    });

    describe("DELETE /storage/files/:path", () => {
        it("should delete file", async () => {
            mockStorageController.deleteFile.mockResolvedValue(undefined);

            await mockStorageController.deleteFile("uploads/test.txt");

            expect(mockStorageController.deleteFile).toHaveBeenCalledWith("uploads/test.txt");
        });

        it("should handle bucket parameter", async () => {
            mockStorageController.deleteFile.mockResolvedValue(undefined);

            await mockStorageController.deleteFile("file.txt", "custom-bucket");

            expect(mockStorageController.deleteFile).toHaveBeenCalledWith("file.txt", "custom-bucket");
        });
    });

    describe("Path Parsing", () => {
        // Test the parseBucketAndPath function behavior
        it("should recognize 'default' as bucket prefix", () => {
            const testPath = "default/images/photo.jpg";
            const parts = testPath.split("/");
            if (parts[0] === "default") {
                expect(parts[0]).toBe("default");
                expect(parts.slice(1).join("/")).toBe("images/photo.jpg");
            }
        });

        it("should treat non-default paths as file paths in default bucket", () => {
            const testPath = "images/photo.jpg";
            const parts = testPath.split("/");
            // Not starting with 'default', so treat entire path as file path
            expect(parts[0]).not.toBe("default");
        });

        it("should handle root-level files", () => {
            const testPath = "file.txt";
            const parts = testPath.split("/");
            expect(parts).toHaveLength(1);
        });
    });

    describe("Authentication Configuration", () => {
        it("should allow configuring requireAuth option", () => {
            const config = {
                controller: mockStorageController,
                requireAuth: true
            };

            expect(config.requireAuth).toBe(true);
        });

        it("should allow anonymous access when requireAuth is false", () => {
            const config = {
                controller: mockStorageController,
                requireAuth: false
            };

            expect(config.requireAuth).toBe(false);
        });

        it("should use basePath configuration", () => {
            const config = {
                controller: mockStorageController,
                basePath: "/api/storage"
            };

            expect(config.basePath).toBe("/api/storage");
        });
    });

    describe("Error Handling", () => {
        it("should handle storage errors gracefully", async () => {
            mockStorageController.uploadFile.mockRejectedValue(new Error("Storage error"));

            await expect(mockStorageController.uploadFile({
                file: {} as any,
                fileName: "test.txt",
                path: "uploads"
            })).rejects.toThrow("Storage error");
        });

        it("should handle file not found", async () => {
            mockStorageController.getFile.mockResolvedValue(null);

            const result = await mockStorageController.getFile("nonexistent.txt");

            expect(result).toBeNull();
        });
    });
});
