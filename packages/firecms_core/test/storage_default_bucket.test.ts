import { describe, expect, it, jest } from "@jest/globals";

jest.mock("firebase/storage", () => ({
    getStorage: jest.fn((_app: unknown, bucket?: string) => ({ bucket })),
    ref: jest.fn((storage: unknown) => storage),
    getDownloadURL: jest.fn(async () => "http://localhost/file"),
    getMetadata: jest.fn(async () => ({ bucket: "demo.appspot.com" })),
    deleteObject: jest.fn(), list: jest.fn(), uploadBytesResumable: jest.fn()
}));

import { getStorage } from "firebase/storage";
import { useFirebaseStorageSource } from "../../firebase_firecms/src/hooks/useFirebaseStorageSource.js";

describe("Firebase storage bucket resolution", () => {
    it("uses the default storage instance when the explicit bucket is the default bucket", async () => {
        const app = { options: { projectId: "demo", storageBucket: "demo.appspot.com" } } as any;
        await useFirebaseStorageSource({ firebaseApp: app }).getDownloadURL("images/a.png", "demo.appspot.com");
        expect(getStorage).toHaveBeenCalledWith(app, undefined);
    });
});
