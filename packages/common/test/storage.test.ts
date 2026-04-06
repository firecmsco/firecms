import { resolveStoragePathString, resolveStorageFilenameString } from "../src/util/storage";
import { StorageConfig, StringProperty } from "@rebasepro/types";

// Minimal File mock for Node environment
class MockFile {
    name: string;
    type: string;
    size: number;
    constructor(name: string, type = "image/jpeg", size = 1024) {
        this.name = name;
        this.type = type;
        this.size = size;
    }
}

// Helpers
function makeParams(overrides: Partial<{
    input: string;
    entityId: string;
    path: string;
    fileName: string;
    propertyKey: string;
}> = {}) {
    const file = new MockFile(overrides.fileName ?? "photo.jpg") as unknown as File;
    const storage: StorageConfig = {
        storagePath: "/uploads",
        acceptedFiles: ["image/*"],
    };
    const property: StringProperty = {
        type: "string",
        name: "Image",
        storage,
    };
    return {
        input: overrides.input ?? "{path}/{entityId}/{file}",
        storage,
        values: {},
        entityId: overrides.entityId ?? "entity-123",
        path: overrides.path ?? "products",
        property,
        file,
        propertyKey: overrides.propertyKey ?? "thumbnail",
    };
}

describe("Storage Path Resolution", () => {

    describe("resolveStoragePathString", () => {
        it("replaces {entityId} placeholder", () => {
            const params = makeParams({ input: "uploads/{entityId}/images" });
            const result = resolveStoragePathString(params);
            expect(result).toBe("uploads/entity-123/images");
        });

        it("replaces {path} placeholder", () => {
            const params = makeParams({ input: "{path}/media" });
            const result = resolveStoragePathString(params);
            expect(result).toBe("products/media");
        });

        it("replaces {rand} placeholder with random string", () => {
            const params = makeParams({ input: "uploads/{rand}" });
            const result = resolveStoragePathString(params);
            expect(result).not.toContain("{rand}");
            expect(result.startsWith("uploads/")).toBe(true);
        });

        it("replaces {file} placeholder", () => {
            const params = makeParams({ input: "files/{file}", fileName: "document.pdf" });
            const result = resolveStoragePathString(params);
            expect(result).toBe("files/document.pdf");
        });

        it("replaces {propertyKey}", () => {
            const params = makeParams({ input: "{propertyKey}/files", propertyKey: "avatar" });
            const result = resolveStoragePathString(params);
            expect(result).toBe("avatar/files");
        });

        it("handles multiple placeholders", () => {
            const params = makeParams({ input: "{path}/{entityId}/files" });
            const result = resolveStoragePathString(params);
            expect(result).toBe("products/entity-123/files");
        });

        it("returns literal path when no placeholders", () => {
            const params = makeParams({ input: "static/uploads" });
            const result = resolveStoragePathString(params);
            expect(result).toBe("static/uploads");
        });

        it("calls function input when provided", () => {
            const params = {
                ...makeParams(),
                input: (() => "custom/path") as any,
            };
            const result = resolveStoragePathString(params);
            expect(result).toBe("custom/path");
        });
    });

    describe("resolveStorageFilenameString", () => {
        it("replaces {file.name} and {file.ext}", async () => {
            const params = makeParams({ input: "{file.name}_thumb.{file.ext}", fileName: "photo.jpg" });
            const result = await resolveStorageFilenameString(params);
            expect(result).toBe("photo_thumb.jpg");
        });

        it("replaces {rand} with unique string", async () => {
            const params = makeParams({ input: "{rand}.jpg" });
            const result = await resolveStorageFilenameString(params);
            expect(result).not.toContain("{rand}");
            expect(result.endsWith(".jpg")).toBe(true);
        });

        it("replaces {entityId}", async () => {
            const params = makeParams({ input: "{entityId}_{file}", entityId: "e42", fileName: "avatar.png" });
            const result = await resolveStorageFilenameString(params);
            expect(result).toBe("e42_avatar.png");
        });

        it("calls async function input when provided", async () => {
            const params = {
                ...makeParams(),
                input: (async () => "dynamic-name.jpg") as any,
            };
            const result = await resolveStorageFilenameString(params);
            expect(result).toBe("dynamic-name.jpg");
        });

        it("generates random fallback when function returns empty", async () => {
            const params = {
                ...makeParams(),
                input: (() => "") as any,
            };
            const result = await resolveStorageFilenameString(params);
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThan(0);
        });
    });
});
