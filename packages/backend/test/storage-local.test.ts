import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { LocalStorageController } from "../src/storage/LocalStorageController";

describe("LocalStorageController", () => {
    let controller: LocalStorageController;
    let tempDir: string;

    beforeEach(async () => {
        // Create a temporary directory for tests
        tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "firecms-storage-test-"));
        controller = new LocalStorageController({
            basePath: tempDir
        });
    });

    afterEach(async () => {
        // Clean up temporary directory
        await fs.promises.rm(tempDir, { recursive: true, force: true });
    });

    describe("constructor", () => {
        it("should initialize with basePath", () => {
            expect(controller.getBasePath()).toBe(tempDir);
        });

        it("should return 'local' as type", () => {
            expect(controller.getType()).toBe("local");
        });
    });

    describe("uploadFile", () => {
        it("should upload a file and return metadata", async () => {
            const content = Buffer.from("Hello, World!");
            const file = new File([content], "test.txt", { type: "text/plain" });

            const result = await controller.uploadFile({
                file,
                fileName: "test.txt",
                path: "uploads"
            });

            expect(result.path).toContain("uploads");
            expect(result.path).toContain("test.txt");

            // Verify file exists on disk (uses default bucket)
            const filePath = path.join(tempDir, "default", "uploads", "test.txt");
            const exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
            expect(exists).toBe(true);
        });

        it("should create nested directories", async () => {
            const content = Buffer.from("Nested content");
            const file = new File([content], "nested.txt", { type: "text/plain" });

            await controller.uploadFile({
                file,
                fileName: "nested.txt",
                path: "level1/level2/level3"
            });

            const filePath = path.join(tempDir, "default", "level1", "level2", "level3", "nested.txt");
            const exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
            expect(exists).toBe(true);
        });

        it("should handle custom bucket", async () => {
            const content = Buffer.from("Bucket content");
            const file = new File([content], "bucket.txt", { type: "text/plain" });

            await controller.uploadFile({
                file,
                fileName: "bucket.txt",
                path: "files",
                bucket: "custom-bucket"
            });

            const filePath = path.join(tempDir, "custom-bucket", "files", "bucket.txt");
            const exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
            expect(exists).toBe(true);
        });

        it("should store metadata alongside file", async () => {
            const content = Buffer.from("With metadata");
            const file = new File([content], "meta.txt", { type: "text/plain" });

            await controller.uploadFile({
                file,
                fileName: "meta.txt",
                path: "uploads",
                metadata: { customField: "customValue" }
            });

            // Implementation uses .metadata.json extension
            const metadataPath = path.join(tempDir, "default", "uploads", "meta.txt.metadata.json");
            const exists = await fs.promises.access(metadataPath).then(() => true).catch(() => false);
            expect(exists).toBe(true);
        });
    });

    describe("getFile", () => {
        it("should retrieve an uploaded file using local:// URL format", async () => {
            const content = Buffer.from("Retrieve me");
            const file = new File([content], "retrieve.txt", { type: "text/plain" });

            const uploadResult = await controller.uploadFile({
                file,
                fileName: "retrieve.txt",
                path: "uploads"
            });

            // Use the storageUrl from upload result (local:// format)
            const retrieved = await controller.getFile(uploadResult.storageUrl!);

            expect(retrieved).not.toBeNull();
            expect(retrieved?.name).toBe("retrieve.txt");
        });

        it("should return null for non-existent file", async () => {
            const result = await controller.getFile("local://default/nonexistent/file.txt");
            expect(result).toBeNull();
        });
    });

    describe("deleteFile", () => {
        it("should delete an uploaded file using local:// URL format", async () => {
            const content = Buffer.from("Delete me");
            const file = new File([content], "delete.txt", { type: "text/plain" });

            const uploadResult = await controller.uploadFile({
                file,
                fileName: "delete.txt",
                path: "uploads"
            });

            // Verify file exists
            const filePath = path.join(tempDir, "default", "uploads", "delete.txt");
            let exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
            expect(exists).toBe(true);

            // Delete the file using local:// URL format
            await controller.deleteFile(uploadResult.storageUrl!);

            // Verify file no longer exists
            exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
            expect(exists).toBe(false);
        });

        it("should not throw when deleting non-existent file", async () => {
            await expect(controller.deleteFile("local://default/nonexistent/file.txt")).resolves.not.toThrow();
        });

        it("should also delete metadata file", async () => {
            const content = Buffer.from("Delete with metadata");
            const file = new File([content], "withmeta.txt", { type: "text/plain" });

            const uploadResult = await controller.uploadFile({
                file,
                fileName: "withmeta.txt",
                path: "uploads",
                metadata: { key: "value" }
            });

            await controller.deleteFile(uploadResult.storageUrl!);

            const metadataPath = path.join(tempDir, "default", "uploads", "withmeta.txt.metadata.json");
            const exists = await fs.promises.access(metadataPath).then(() => true).catch(() => false);
            expect(exists).toBe(false);
        });
    });

    describe("list", () => {
        beforeEach(async () => {
            // Upload some test files
            for (let i = 1; i <= 5; i++) {
                const file = new File([`Content ${i}`], `file${i}.txt`, { type: "text/plain" });
                await controller.uploadFile({
                    file,
                    fileName: `file${i}.txt`,
                    path: "listtest"
                });
            }
        });

        it("should list files in a directory", async () => {
            const result = await controller.list("listtest", { bucket: "default" });

            // Items should be the actual files (not metadata files)
            expect(result.items.length).toBeGreaterThanOrEqual(5);
        });

        it("should return empty list for non-existent directory", async () => {
            const result = await controller.list("nonexistent", { bucket: "default" });

            expect(result.items).toHaveLength(0);
        });
    });

    describe("getDownloadURL", () => {
        it("should return download URL for existing file", async () => {
            const content = Buffer.from("Download me");
            const file = new File([content], "download.txt", { type: "text/plain" });

            const uploadResult = await controller.uploadFile({
                file,
                fileName: "download.txt",
                path: "uploads"
            });

            // Use the storageUrl from upload result
            const result = await controller.getDownloadURL(uploadResult.storageUrl!);

            expect(result.url).toBeTruthy();
            expect(result.fileNotFound).toBeFalsy();
        });

        it("should return fileNotFound for non-existent file", async () => {
            const result = await controller.getDownloadURL("local://default/nonexistent/file.txt");

            expect(result.fileNotFound).toBe(true);
        });
    });

    describe("getAbsolutePath", () => {
        it("should return absolute filesystem path without bucket", () => {
            const absPath = controller.getAbsolutePath("uploads/test.txt");

            // getAbsolutePath uses getFullPath which doesn't include bucket unless specified
            expect(absPath).toBe(path.join(tempDir, "uploads", "test.txt"));
        });

        it("should handle custom bucket", () => {
            const absPath = controller.getAbsolutePath("uploads/test.txt", "custom");

            expect(absPath).toBe(path.join(tempDir, "custom", "uploads", "test.txt"));
        });
    });

    describe("validateFile", () => {
        it("should accept valid file", () => {
            const file = new File(["content"], "valid.txt", { type: "text/plain" });

            // Should not throw
            expect(() => {
                (controller as any).validateFile(file);
            }).not.toThrow();
        });

        it("should reject file exceeding max size", () => {
            // Create a controller with small max size
            const smallController = new LocalStorageController({
                basePath: tempDir,
                maxFileSize: 10 // 10 bytes
            });

            const largeContent = Buffer.alloc(100);
            const file = new File([largeContent], "large.txt", { type: "text/plain" });

            expect(() => {
                (smallController as any).validateFile(file);
            }).toThrow(/exceeds/i);
        });

        it("should reject disallowed file types", () => {
            const controllerWithTypes = new LocalStorageController({
                basePath: tempDir,
                allowedMimeTypes: ["image/png", "image/jpeg"]
            });

            const file = new File(["content"], "script.js", { type: "application/javascript" });

            expect(() => {
                (controllerWithTypes as any).validateFile(file);
            }).toThrow(/not allowed/i);
        });
    });
});
