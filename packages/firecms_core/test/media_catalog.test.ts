import { describe, expect, it, jest } from "@jest/globals";
import { registerMediaAsset } from "../../media_manager/src/media_catalog.js";

describe("media catalog registration", () => {
    it("registers the storage path, bucket, and metadata", async () => {
        const save = jest.fn(async (_record: any) => undefined);
        await registerMediaAsset({ fileName: "shoe.png", mimeType: "image/png", size: 12, storagePath: "images/shoe.png", bucket: "demo" }, save);
        expect(save).toHaveBeenCalledWith(expect.objectContaining({ storagePath: "images/shoe.png", bucket: "demo" }));
    });

    it("propagates catalog failures so callers can warn about the uploaded file", async () => {
        await expect(registerMediaAsset({ fileName: "shoe.png", mimeType: "image/png", size: 12, storagePath: "images/shoe.png" }, async () => { throw new Error("offline"); })).rejects.toThrow("offline");
    });
});
