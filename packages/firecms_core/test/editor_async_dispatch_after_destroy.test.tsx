/**
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import React from "react";
import { render } from "@testing-library/react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "../src/editor/schema";
import { createDropImagePlugin, onFileRead, UploadFn } from "../src/editor/extensions/Image";
import { useProseMirror } from "../src/editor/hooks/useProseMirror";

/**
 * Sentry FIRECMS-SASS-12J: "Cannot read properties of null (reading 'matchesNode')".
 *
 * Uploading an image into the markdown editor is asynchronous three times over
 * (FileReader, the upload, the preload of the uploaded URL), and the editor can
 * unmount during any of them — the user closes the entity while the image is
 * still uploading. The preload's onload then dispatched a transaction on the
 * destroyed EditorView, and ProseMirror threw because its `docView` was null.
 */

type FakeImage = { src: string, onload: null | (() => void), onerror: null | (() => void) };

const createdImages: FakeImage[] = [];
const OriginalImage = globalThis.Image;

beforeEach(() => {
    createdImages.length = 0;
    // jsdom never loads image URLs, so capture the preloader and fire its
    // callbacks by hand.
    (globalThis as any).Image = class {
        src = "";
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;

        constructor() {
            createdImages.push(this);
        }
    };
});

afterEach(() => {
    (globalThis as any).Image = OriginalImage;
});

function createView(upload: UploadFn) {
    const mount = document.createElement("div");
    document.body.appendChild(mount);
    const state = EditorState.create({
        schema,
        doc: schema.node("doc", null, [schema.node("paragraph")]),
        plugins: [createDropImagePlugin(upload)]
    });
    return new EditorView(mount, { state });
}

const readerEvent = { target: { result: "data:image/png;base64,AAAA" } } as unknown as ProgressEvent<FileReader>;
const file = new File(["png"], "photo.png", { type: "image/png" });

function imageNodes(view: EditorView) {
    const found: string[] = [];
    view.state.doc.descendants((node) => {
        if (node.type.name === "image") found.push(node.attrs.src);
    });
    return found;
}

describe("image upload into the editor", () => {

    it("replaces the placeholder with the uploaded image while the editor is mounted", async () => {
        const view = createView(async () => "https://cdn.example.com/photo.png");

        await onFileRead(view, readerEvent, 0, async () => "https://cdn.example.com/photo.png", file);
        expect(createdImages).toHaveLength(1);

        createdImages[0].onload!();

        expect(imageNodes(view)).toEqual(["https://cdn.example.com/photo.png"]);
        view.destroy();
    });

    it("does not throw when the uploaded image finishes loading after the editor was destroyed", async () => {
        const upload = async () => "https://cdn.example.com/photo.png";
        const view = createView(upload);

        await onFileRead(view, readerEvent, 0, upload, file);
        expect(createdImages).toHaveLength(1);

        view.destroy();

        expect(() => createdImages[0].onload!()).not.toThrow();
        expect(() => createdImages[0].onerror!()).not.toThrow();
    });

    it("does not touch the editor when the upload resolves after it was destroyed", async () => {
        // The upload only resolves on a later task, after the view is gone.
        const upload = () => new Promise<string>((resolve) => {
            setTimeout(() => resolve("https://cdn.example.com/photo.png"), 0);
        });
        const view = createView(upload);

        const pending = onFileRead(view, readerEvent, 0, upload, file);
        view.destroy();

        await expect(pending).resolves.toBeUndefined();
        expect(createdImages).toHaveLength(0);
    });

    it("does nothing when the file finishes reading after the editor was destroyed", async () => {
        const upload = jest.fn(async () => "https://cdn.example.com/photo.png");
        const view = createView(upload);
        view.destroy();

        await expect(onFileRead(view, readerEvent, 0, upload, file)).resolves.toBeUndefined();
        expect(upload).not.toHaveBeenCalled();
    });
});

describe("useProseMirror", () => {
    it("ignores transactions dispatched after the editor unmounted", () => {
        let captured: EditorView | null = null;

        function Editor() {
            const { view, editorRef } = useProseMirror({ initialContent: "hello" });
            captured = view;
            return <div ref={editorRef}/>;
        }

        const { unmount } = render(<Editor/>);
        const view = captured as EditorView | null;
        expect(view).not.toBeNull();

        unmount();
        expect(view!.isDestroyed).toBe(true);

        expect(() => view!.dispatch(view!.state.tr.insertText("late"))).not.toThrow();
    });
});
