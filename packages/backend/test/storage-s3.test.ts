import { S3StorageController } from "../src/storage/S3StorageController";

// Mock the AWS SDK before importing the controller
jest.mock("@aws-sdk/client-s3", () => ({
    S3Client: jest.fn().mockImplementation(() => ({
        send: jest.fn()
    })),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    ListObjectsV2Command: jest.fn(),
    HeadObjectCommand: jest.fn()
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
    getSignedUrl: jest.fn().mockResolvedValue("https://presigned-url.example.com")
}));

// Import the mocked modules
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

describe("S3StorageController", () => {
    let controller: S3StorageController;
    let mockSend: jest.Mock;

    const defaultConfig = {
        bucket: "test-bucket",
        region: "us-east-1",
        accessKeyId: "test-access-key",
        secretAccessKey: "test-secret-key"
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockSend = jest.fn();
        (S3Client as jest.Mock).mockImplementation(() => ({
            send: mockSend
        }));
        controller = new S3StorageController(defaultConfig);
    });

    describe("constructor", () => {
        it("should initialize S3 client with credentials", () => {
            expect(S3Client).toHaveBeenCalledWith(expect.objectContaining({
                region: "us-east-1",
                credentials: {
                    accessKeyId: "test-access-key",
                    secretAccessKey: "test-secret-key"
                }
            }));
        });

        it("should initialize with endpoint for S3-compatible services", () => {
            jest.clearAllMocks();
            new S3StorageController({
                ...defaultConfig,
                endpoint: "https://minio.example.com",
                forcePathStyle: true
            });

            expect(S3Client).toHaveBeenCalledWith(expect.objectContaining({
                endpoint: "https://minio.example.com",
                forcePathStyle: true
            }));
        });

        it("should return 's3' as type", () => {
            expect(controller.getType()).toBe("s3");
        });
    });

    describe("uploadFile", () => {
        it("should upload file using PutObjectCommand", async () => {
            const content = Buffer.from("Test content");
            const file = new File([content], "test.txt", { type: "text/plain" });

            mockSend.mockResolvedValueOnce({});

            const result = await controller.uploadFile({
                file,
                fileName: "test.txt",
                path: "uploads"
            });

            expect(PutObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
                Bucket: "test-bucket",
                Key: "uploads/test.txt",
                ContentType: "text/plain"
            }));
            expect(mockSend).toHaveBeenCalled();
            expect(result.path).toBe("uploads/test.txt");
        });

        it("should include metadata in upload", async () => {
            const file = new File(["content"], "test.txt", { type: "text/plain" });

            mockSend.mockResolvedValueOnce({});

            await controller.uploadFile({
                file,
                fileName: "test.txt",
                path: "uploads",
                metadata: { customKey: "customValue" }
            });

            expect(PutObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
                Metadata: expect.objectContaining({
                    customKey: "customValue" // Keys are passed as-is, S3 handles casing
                })
            }));
        });

        it("should use custom bucket when specified", async () => {
            const file = new File(["content"], "test.txt", { type: "text/plain" });

            mockSend.mockResolvedValueOnce({});

            await controller.uploadFile({
                file,
                fileName: "test.txt",
                path: "uploads",
                bucket: "custom-bucket"
            });

            expect(PutObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
                Bucket: "custom-bucket"
            }));
        });
    });

    describe("getDownloadURL", () => {
        it("should generate presigned URL", async () => {
            mockSend.mockResolvedValueOnce({
                ContentType: "text/plain",
                ContentLength: 100,
                LastModified: new Date(),
                Metadata: {}
            });

            const result = await controller.getDownloadURL("uploads/test.txt");

            expect(getSignedUrl).toHaveBeenCalled();
            expect(result.url).toBe("https://presigned-url.example.com");
        });

        it("should include metadata in download config", async () => {
            const lastModified = new Date("2024-01-15T10:00:00Z");
            mockSend.mockResolvedValueOnce({
                ContentType: "image/png",
                ContentLength: 5000,
                LastModified: lastModified,
                Metadata: { originalName: "photo.png" }
            });

            const result = await controller.getDownloadURL("images/photo.png");

            expect(result.metadata).toBeDefined();
            expect(result.metadata?.contentType).toBe("image/png");
        });
    });

    describe("getFile", () => {
        it("should return null for non-existent file", async () => {
            const error = new Error("NoSuchKey");
            (error as any).name = "NoSuchKey";
            mockSend.mockRejectedValueOnce(error);

            const result = await controller.getFile("nonexistent.txt");

            expect(result).toBeNull();
        });
    });

    describe("deleteFile", () => {
        it("should delete file from S3", async () => {
            mockSend.mockResolvedValueOnce({});

            await controller.deleteFile("uploads/test.txt");

            expect(DeleteObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
                Bucket: "test-bucket",
                Key: "uploads/test.txt"
            }));
        });

        it("should not throw for non-existent file", async () => {
            mockSend.mockResolvedValueOnce({});

            await expect(controller.deleteFile("nonexistent.txt")).resolves.not.toThrow();
        });
    });

    describe("list", () => {
        it("should list objects in S3 bucket", async () => {
            mockSend.mockResolvedValueOnce({
                Contents: [
                    { Key: "uploads/file1.txt", Size: 100, LastModified: new Date() },
                    { Key: "uploads/file2.txt", Size: 200, LastModified: new Date() }
                ],
                CommonPrefixes: [],
                IsTruncated: false
            });

            const result = await controller.list("uploads");

            expect(ListObjectsV2Command).toHaveBeenCalledWith(expect.objectContaining({
                Bucket: "test-bucket",
                Prefix: "uploads"  // Implementation doesn't add trailing slash
            }));
            expect(result.items).toHaveLength(2);
        });

        it("should handle pagination with maxResults", async () => {
            mockSend.mockResolvedValueOnce({
                Contents: [
                    { Key: "uploads/file1.txt", Size: 100, LastModified: new Date() }
                ],
                CommonPrefixes: [],
                IsTruncated: true,
                NextContinuationToken: "token123"
            });

            const result = await controller.list("uploads", { maxResults: 1 });

            expect(ListObjectsV2Command).toHaveBeenCalledWith(expect.objectContaining({
                MaxKeys: 1
            }));
            expect(result.nextPageToken).toBe("token123");
        });

        it("should include common prefixes as subdirectories", async () => {
            mockSend.mockResolvedValueOnce({
                Contents: [],
                CommonPrefixes: [
                    { Prefix: "uploads/images/" },
                    { Prefix: "uploads/documents/" }
                ],
                IsTruncated: false
            });

            const result = await controller.list("uploads");

            expect(result.prefixes).toHaveLength(2);
        });

        it("should use pageToken for continuation", async () => {
            mockSend.mockResolvedValueOnce({
                Contents: [],
                CommonPrefixes: [],
                IsTruncated: false
            });

            await controller.list("uploads", { pageToken: "continue-token" });

            expect(ListObjectsV2Command).toHaveBeenCalledWith(expect.objectContaining({
                ContinuationToken: "continue-token"
            }));
        });
    });

    describe("validateFile", () => {
        it("should accept valid file", () => {
            const file = new File(["content"], "valid.txt", { type: "text/plain" });

            expect(() => {
                (controller as any).validateFile(file);
            }).not.toThrow();
        });

        it("should reject file exceeding max size", () => {
            const smallController = new S3StorageController({
                ...defaultConfig,
                maxFileSize: 10 // 10 bytes
            });

            const largeContent = Buffer.alloc(100);
            const file = new File([largeContent], "large.txt", { type: "text/plain" });

            expect(() => {
                (smallController as any).validateFile(file);
            }).toThrow(/exceeds/i);
        });
    });

    describe("flattenMetadata", () => {
        it("should flatten nested metadata to strings", () => {
            const metadata = {
                simple: "value",
                number: 42,
                nested: { key: "value" }
            };

            const flattened = (controller as any).flattenMetadata(metadata);

            expect(flattened.simple).toBe("value");
            expect(flattened.number).toBe("42");
            expect(typeof flattened.nested).toBe("string");
        });
    });
});
