import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createStorage } from "../src/storage";
import { Transport } from "../src/transport";

function createMockTransport(): jest.Mocked<Transport> {
    return {
        request: jest.fn(),
        fetchFn: jest.fn(),
        baseUrl: "http://localhost:3000",
        apiPath: "/api",
        resolveToken: jest.fn(),
        getHeaders: jest.fn().mockReturnValue({ Authorization: "Bearer token" }),
        setToken: jest.fn(),
        setAuthTokenGetter: jest.fn(),
    } as unknown as jest.Mocked<Transport>;
}

describe("Storage", () => {
    let mockTransport: jest.Mocked<Transport>;

    beforeEach(() => {
        mockTransport = createMockTransport();
    });

    // -----------------------------------------------------------------------
    // uploadFile
    // -----------------------------------------------------------------------
    describe("uploadFile", () => {
        it("uploads a file and returns the result", async () => {
            const storage = createStorage(mockTransport);
            const mockFile = new File(["content"], "test.txt", { type: "text/plain" });

            mockTransport.request.mockResolvedValueOnce({
                data: { fileName: "test.txt", path: "test.txt" }
            });

            const result = await storage.uploadFile({
                file: mockFile,
                fileName: "test.txt",
                path: "uploads/test.txt",
                bucket: "my-bucket",
                metadata: { customField: "value1", numericField: 123 }
            });

            expect(mockTransport.request).toHaveBeenCalledWith("/storage/upload", expect.objectContaining({
                method: "POST",
                body: expect.any(FormData)
            }));
            expect(result).toEqual({ fileName: "test.txt", path: "test.txt" });
        });

        it("appends all FormData fields correctly", async () => {
            const storage = createStorage(mockTransport);
            const mockFile = new File(["data"], "photo.jpg", { type: "image/jpeg" });

            mockTransport.request.mockResolvedValueOnce({ data: {} });

            await storage.uploadFile({
                file: mockFile,
                fileName: "photo.jpg",
                path: "images/",
                bucket: "media",
                metadata: { alt: "A photo", width: 800 }
            });

            const formData = mockTransport.request.mock.calls[0][1]!.body as FormData;
            expect(formData.get("file")).toBeDefined();
            expect(formData.get("fileName")).toBe("photo.jpg");
            expect(formData.get("path")).toBe("images/");
            expect(formData.get("bucket")).toBe("media");
            expect(formData.get("metadata_alt")).toBe("A photo");
            expect(formData.get("metadata_width")).toBe("800"); // JSON.stringify for non-string
        });

        it("handles upload without optional parameters", async () => {
            const storage = createStorage(mockTransport);
            const mockFile = new File(["data"], "file.bin");

            mockTransport.request.mockResolvedValueOnce({ data: { fileName: "file.bin" } });

            const result = await storage.uploadFile({ file: mockFile });
            expect(result).toEqual({ fileName: "file.bin" });

            const formData = mockTransport.request.mock.calls[0][1]!.body as FormData;
            expect(formData.get("file")).toBeDefined();
            expect(formData.get("fileName")).toBeNull();
            expect(formData.get("path")).toBeNull();
            expect(formData.get("bucket")).toBeNull();
        });

        it("skips null/undefined metadata values", async () => {
            const storage = createStorage(mockTransport);
            const mockFile = new File(["data"], "file.bin");

            mockTransport.request.mockResolvedValueOnce({ data: {} });

            await storage.uploadFile({
                file: mockFile,
                metadata: { valid: "yes", nope: undefined, alsoNope: null } as any
            });

            const formData = mockTransport.request.mock.calls[0][1]!.body as FormData;
            expect(formData.get("metadata_valid")).toBe("yes");
            expect(formData.get("metadata_nope")).toBeNull();
            expect(formData.get("metadata_alsoNope")).toBeNull();
        });
    });

    // -----------------------------------------------------------------------
    // getDownloadURL
    // -----------------------------------------------------------------------
    describe("getDownloadURL", () => {
        it("fetches metadata and returns a download config", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.request.mockResolvedValueOnce({ data: { size: 100 } });
            mockTransport.resolveToken.mockResolvedValueOnce("my-token");

            const result = await storage.getDownloadURL("file.jpg", "bucket");

            expect(mockTransport.request).toHaveBeenCalledWith("/storage/metadata/bucket/file.jpg");
            expect(result).toEqual({
                url: "http://localhost:3000/api/storage/file/bucket/file.jpg?token=my-token",
                metadata: { size: 100 }
            });
        });

        it("strips local:// prefix", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.request.mockResolvedValueOnce({ data: { size: 100 } });
            mockTransport.resolveToken.mockResolvedValueOnce(null);

            const result = await storage.getDownloadURL("local://file.jpg");

            expect(mockTransport.request).toHaveBeenCalledWith("/storage/metadata/file.jpg");
            expect(result).toEqual({
                url: "http://localhost:3000/api/storage/file/file.jpg",
                metadata: { size: 100 }
            });
        });

        it("strips s3:// prefix", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.request.mockResolvedValueOnce({ data: {} });
            mockTransport.resolveToken.mockResolvedValueOnce(null);

            await storage.getDownloadURL("s3://bucket/file.jpg");

            expect(mockTransport.request).toHaveBeenCalledWith("/storage/metadata/bucket/file.jpg");
        });

        it("does not duplicate bucket prefix if already present", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.request.mockResolvedValueOnce({ data: {} });
            mockTransport.resolveToken.mockResolvedValueOnce(null);

            await storage.getDownloadURL("mybucket/file.jpg", "mybucket");

            expect(mockTransport.request).toHaveBeenCalledWith("/storage/metadata/mybucket/file.jpg");
        });

        it("omits token query when no token available", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.request.mockResolvedValueOnce({ data: {} });
            mockTransport.resolveToken.mockResolvedValueOnce(null);

            const result = await storage.getDownloadURL("file.jpg");
            expect(result.url).toBe("http://localhost:3000/api/storage/file/file.jpg");
            expect(result.url).not.toContain("?token=");
        });

        it("returns cached result on subsequent calls", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.request.mockResolvedValueOnce({ data: { size: 50 } });
            mockTransport.resolveToken.mockResolvedValueOnce("tok");

            const first = await storage.getDownloadURL("cached.jpg");
            const second = await storage.getDownloadURL("cached.jpg");

            expect(first).toEqual(second);
            expect(mockTransport.request).toHaveBeenCalledTimes(1); // Only one actual request
        });

        it("uses separate cache keys for different buckets", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.request.mockResolvedValueOnce({ data: { size: 1 } });
            mockTransport.resolveToken.mockResolvedValueOnce(null);
            await storage.getDownloadURL("file.jpg", "bucket-a");

            mockTransport.request.mockResolvedValueOnce({ data: { size: 2 } });
            mockTransport.resolveToken.mockResolvedValueOnce(null);
            await storage.getDownloadURL("file.jpg", "bucket-b");

            expect(mockTransport.request).toHaveBeenCalledTimes(2);
        });

        it("handles 404 cleanly", async () => {
            const storage = createStorage(mockTransport);

            const error = new Error("Not Found");
            (error as any).status = 404;
            mockTransport.request.mockRejectedValueOnce(error);

            const result = await storage.getDownloadURL("missing.jpg");
            expect(result).toEqual({ url: null, fileNotFound: true });
        });

        it("rethrows non-404 errors", async () => {
            const storage = createStorage(mockTransport);

            const error = new Error("Server Error");
            (error as any).status = 500;
            mockTransport.request.mockRejectedValueOnce(error);

            await expect(storage.getDownloadURL("error.jpg")).rejects.toThrow("Server Error");
        });
    });

    // -----------------------------------------------------------------------
    // getFile
    // -----------------------------------------------------------------------
    describe("getFile", () => {
        it("returns a File object on success", async () => {
            const storage = createStorage(mockTransport);
            const mockBlob = new Blob(["content"], { type: "text/plain" });

            mockTransport.fetchFn.mockResolvedValueOnce({
                ok: true,
                status: 200,
                blob: async () => mockBlob
            } as any);

            const result = await storage.getFile("my_file.txt");

            expect(mockTransport.fetchFn).toHaveBeenCalledWith(
                "http://localhost:3000/api/storage/file/my_file.txt",
                { headers: { Authorization: "Bearer token" } }
            );

            expect(result).toBeInstanceOf(File);
            expect(result?.name).toBe("my_file.txt");
            expect(result?.type).toBe("text/plain");
        });

        it("returns null on 404", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.fetchFn.mockResolvedValueOnce({
                status: 404,
                ok: false,
            } as any);

            const result = await storage.getFile("missing.txt");
            expect(result).toBeNull();
        });

        it("throws error on non-ok status", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.fetchFn.mockResolvedValueOnce({
                status: 500,
                ok: false,
            } as any);

            await expect(storage.getFile("error.txt")).rejects.toThrow("Failed to get file");
        });

        it("strips local:// prefix", async () => {
            const storage = createStorage(mockTransport);
            const mockBlob = new Blob(["x"]);

            mockTransport.fetchFn.mockResolvedValueOnce({
                ok: true,
                status: 200,
                blob: async () => mockBlob
            } as any);

            await storage.getFile("local://images/photo.jpg");

            expect(mockTransport.fetchFn).toHaveBeenCalledWith(
                "http://localhost:3000/api/storage/file/images/photo.jpg",
                expect.any(Object)
            );
        });

        it("strips s3:// prefix", async () => {
            const storage = createStorage(mockTransport);
            const mockBlob = new Blob(["x"]);

            mockTransport.fetchFn.mockResolvedValueOnce({
                ok: true,
                status: 200,
                blob: async () => mockBlob
            } as any);

            await storage.getFile("s3://bucket/file.dat");

            expect(mockTransport.fetchFn).toHaveBeenCalledWith(
                "http://localhost:3000/api/storage/file/bucket/file.dat",
                expect.any(Object)
            );
        });

        it("prepends bucket prefix when specified", async () => {
            const storage = createStorage(mockTransport);
            const mockBlob = new Blob(["x"]);

            mockTransport.fetchFn.mockResolvedValueOnce({
                ok: true,
                status: 200,
                blob: async () => mockBlob
            } as any);

            await storage.getFile("photo.jpg", "media");

            expect(mockTransport.fetchFn).toHaveBeenCalledWith(
                "http://localhost:3000/api/storage/file/media/photo.jpg",
                expect.any(Object)
            );
        });

        it("does not duplicate bucket prefix if already present", async () => {
            const storage = createStorage(mockTransport);
            const mockBlob = new Blob(["x"]);

            mockTransport.fetchFn.mockResolvedValueOnce({
                ok: true,
                status: 200,
                blob: async () => mockBlob
            } as any);

            await storage.getFile("media/photo.jpg", "media");

            expect(mockTransport.fetchFn).toHaveBeenCalledWith(
                "http://localhost:3000/api/storage/file/media/photo.jpg",
                expect.any(Object)
            );
        });

        it("uses filename from path for File name", async () => {
            const storage = createStorage(mockTransport);
            const mockBlob = new Blob(["x"], { type: "image/png" });

            mockTransport.fetchFn.mockResolvedValueOnce({
                ok: true,
                status: 200,
                blob: async () => mockBlob
            } as any);

            const result = await storage.getFile("deep/nested/image.png");
            expect(result?.name).toBe("image.png");
        });
    });

    // -----------------------------------------------------------------------
    // deleteFile
    // -----------------------------------------------------------------------
    describe("deleteFile", () => {
        it("calls delete request and clears cache", async () => {
            const storage = createStorage(mockTransport);

            // Pre-warm the cache from a get call
            mockTransport.request.mockResolvedValueOnce({ data: {} });
            mockTransport.resolveToken.mockResolvedValueOnce(null);
            await storage.getDownloadURL("file.txt", "bucket");

            mockTransport.request.mockResolvedValueOnce({});
            await storage.deleteFile("file.txt", "bucket");

            expect(mockTransport.request).toHaveBeenCalledWith("/storage/file/bucket/file.txt", { method: "DELETE" });

            // Ensure cache is cleared by verifying a new request is made
            mockTransport.request.mockResolvedValueOnce({ data: {} });
            mockTransport.resolveToken.mockResolvedValueOnce(null);
            await storage.getDownloadURL("file.txt", "bucket");
            expect(mockTransport.request).toHaveBeenCalledTimes(3); // 1st meta + delete + 2nd meta
        });

        it("ignores 404 errors", async () => {
            const storage = createStorage(mockTransport);

            const error = new Error("Not Found");
            (error as any).status = 404;
            mockTransport.request.mockRejectedValueOnce(error);

            await expect(storage.deleteFile("missing.txt")).resolves.toBeUndefined();
        });

        it("throws other errors", async () => {
            const storage = createStorage(mockTransport);

            const error = new Error("Server Error");
            (error as any).status = 500;
            mockTransport.request.mockRejectedValueOnce(error);

            await expect(storage.deleteFile("error.txt")).rejects.toThrow("Server Error");
        });

        it("strips local:// prefix on delete", async () => {
            const storage = createStorage(mockTransport);
            mockTransport.request.mockResolvedValueOnce({});

            await storage.deleteFile("local://files/doc.pdf");
            expect(mockTransport.request).toHaveBeenCalledWith("/storage/file/files/doc.pdf", { method: "DELETE" });
        });

        it("prepends bucket prefix on delete", async () => {
            const storage = createStorage(mockTransport);
            mockTransport.request.mockResolvedValueOnce({});

            await storage.deleteFile("doc.pdf", "docs");
            expect(mockTransport.request).toHaveBeenCalledWith("/storage/file/docs/doc.pdf", { method: "DELETE" });
        });
    });

    // -----------------------------------------------------------------------
    // list
    // -----------------------------------------------------------------------
    describe("list", () => {
        it("builds correct query params", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.request.mockResolvedValueOnce({
                data: { files: [], nextPageToken: "token" }
            });

            const result = await storage.list("folder/", {
                bucket: "my-bucket",
                maxResults: 10,
                pageToken: "startToken"
            });

            expect(mockTransport.request).toHaveBeenCalledWith("/storage/list?path=folder%2F&bucket=my-bucket&maxResults=10&pageToken=startToken");
            expect(result).toEqual({ files: [], nextPageToken: "token" });
        });

        it("works without options", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.request.mockResolvedValueOnce({
                data: { files: [{ name: "a.txt" }] }
            });

            const result = await storage.list("uploads/");
            expect(mockTransport.request).toHaveBeenCalledWith("/storage/list?path=uploads%2F");
            expect(result).toEqual({ files: [{ name: "a.txt" }] });
        });

        it("handles empty path", async () => {
            const storage = createStorage(mockTransport);

            mockTransport.request.mockResolvedValueOnce({ data: { files: [] } });

            await storage.list("");
            // Path would be empty, so it should still call with the query
            expect(mockTransport.request).toHaveBeenCalledWith(expect.stringContaining("/storage/list?"));
        });
    });
});
