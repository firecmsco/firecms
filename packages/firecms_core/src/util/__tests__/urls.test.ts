import { getFileExtensionFromUrl, getPreviewTypeFromUrl, isAbsoluteHttpUrl } from "../urls";

describe("url utilities", () => {

    describe("isAbsoluteHttpUrl", () => {

        it("should detect absolute http and https URLs", () => {
            expect(isAbsoluteHttpUrl("https://abc.com/abc.png")).toBe(true);
            expect(isAbsoluteHttpUrl("http://abc.com/abc.png")).toBe(true);
            expect(isAbsoluteHttpUrl("HTTPS://ABC.COM/ABC.PNG")).toBe(true);
        });

        it("should detect Firebase Storage download URLs as absolute URLs", () => {
            expect(isAbsoluteHttpUrl("https://firebasestorage.googleapis.com/v0/b/demo.appspot.com/o/images%2Fcat.png?alt=media&token=abc")).toBe(true);
            expect(isAbsoluteHttpUrl("https://storage.googleapis.com/demo.appspot.com/images/cat.png")).toBe(true);
        });

        it("should not consider storage paths absolute URLs", () => {
            expect(isAbsoluteHttpUrl("images/cat.png")).toBe(false);
            expect(isAbsoluteHttpUrl("/images/cat.png")).toBe(false);
            expect(isAbsoluteHttpUrl("cat.png")).toBe(false);
        });

        it("should not consider other protocols absolute http URLs", () => {
            expect(isAbsoluteHttpUrl("gs://demo.appspot.com/images/cat.png")).toBe(false);
            expect(isAbsoluteHttpUrl("data:image/png;base64,AAAA")).toBe(false);
            expect(isAbsoluteHttpUrl("//abc.com/abc.png")).toBe(false);
        });

        it("should handle empty values", () => {
            expect(isAbsoluteHttpUrl("")).toBe(false);
            expect(isAbsoluteHttpUrl(undefined)).toBe(false);
            expect(isAbsoluteHttpUrl(null)).toBe(false);
        });

        it("should not match http appearing later in the value", () => {
            expect(isAbsoluteHttpUrl("images/https://abc.com/abc.png")).toBe(false);
        });

    });

    describe("getFileExtensionFromUrl", () => {

        it("should extract the extension of a plain URL", () => {
            expect(getFileExtensionFromUrl("https://abc.com/abc.png")).toBe("png");
        });

        it("should lowercase the extension", () => {
            expect(getFileExtensionFromUrl("https://abc.com/ABC.PNG")).toBe("png");
        });

        it("should ignore query strings and hash fragments", () => {
            expect(getFileExtensionFromUrl("https://abc.com/abc.png?width=200")).toBe("png");
            expect(getFileExtensionFromUrl("https://abc.com/abc.png#anchor")).toBe("png");
            expect(getFileExtensionFromUrl("https://firebasestorage.googleapis.com/v0/b/demo.appspot.com/o/images%2Fcat.jpeg?alt=media&token=abc")).toBe("jpeg");
        });

        it("should work with storage paths", () => {
            expect(getFileExtensionFromUrl("images/cat.webp")).toBe("webp");
        });

        it("should use the last dot of the file name", () => {
            expect(getFileExtensionFromUrl("https://abc.com/archive.tar.gz")).toBe("gz");
        });

        it("should return undefined when there is no extension", () => {
            expect(getFileExtensionFromUrl("https://abc.com/abc")).toBeUndefined();
            expect(getFileExtensionFromUrl("https://abc.com/")).toBeUndefined();
            expect(getFileExtensionFromUrl("images/cat")).toBeUndefined();
        });

        it("should not take dots of the host or the path as extensions", () => {
            expect(getFileExtensionFromUrl("https://abc.com/images/cat")).toBeUndefined();
            expect(getFileExtensionFromUrl("https://abc.com/abc.png/download")).toBeUndefined();
        });

        it("should return undefined for dotfiles and trailing dots", () => {
            expect(getFileExtensionFromUrl("https://abc.com/.gitignore")).toBeUndefined();
            expect(getFileExtensionFromUrl("https://abc.com/abc.")).toBeUndefined();
        });

        it("should handle empty values", () => {
            expect(getFileExtensionFromUrl("")).toBeUndefined();
            expect(getFileExtensionFromUrl(undefined)).toBeUndefined();
            expect(getFileExtensionFromUrl(null)).toBeUndefined();
        });

    });

    describe("getPreviewTypeFromUrl", () => {

        it("should infer image previews", () => {
            expect(getPreviewTypeFromUrl("https://abc.com/abc.png")).toBe("image");
            expect(getPreviewTypeFromUrl("https://abc.com/abc.jpg")).toBe("image");
            expect(getPreviewTypeFromUrl("https://abc.com/abc.jpeg")).toBe("image");
            expect(getPreviewTypeFromUrl("https://abc.com/abc.gif")).toBe("image");
            expect(getPreviewTypeFromUrl("https://abc.com/abc.webp")).toBe("image");
            expect(getPreviewTypeFromUrl("https://abc.com/abc.svg")).toBe("image");
            expect(getPreviewTypeFromUrl("https://abc.com/abc.avif")).toBe("image");
        });

        it("should infer video previews", () => {
            expect(getPreviewTypeFromUrl("https://abc.com/abc.mp4")).toBe("video");
            expect(getPreviewTypeFromUrl("https://abc.com/abc.webm")).toBe("video");
            expect(getPreviewTypeFromUrl("https://abc.com/abc.mov")).toBe("video");
        });

        it("should infer audio previews", () => {
            expect(getPreviewTypeFromUrl("https://abc.com/abc.mp3")).toBe("audio");
            expect(getPreviewTypeFromUrl("https://abc.com/abc.wav")).toBe("audio");
            expect(getPreviewTypeFromUrl("https://abc.com/abc.m4a")).toBe("audio");
        });

        it("should infer the type of Firebase Storage download URLs", () => {
            expect(getPreviewTypeFromUrl("https://firebasestorage.googleapis.com/v0/b/demo.appspot.com/o/images%2Fcat.png?alt=media&token=abc")).toBe("image");
        });

        it("should be case insensitive", () => {
            expect(getPreviewTypeFromUrl("https://abc.com/ABC.PNG")).toBe("image");
        });

        it("should return undefined for unknown or missing extensions", () => {
            expect(getPreviewTypeFromUrl("https://abc.com/abc.pdf")).toBeUndefined();
            expect(getPreviewTypeFromUrl("https://abc.com/abc.zip")).toBeUndefined();
            expect(getPreviewTypeFromUrl("https://abc.com/abc")).toBeUndefined();
            expect(getPreviewTypeFromUrl(undefined)).toBeUndefined();
        });

    });

});
