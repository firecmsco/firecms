"use client";

import React from "react";

import { CircularProgressCenter } from "../components/CircularProgressCenter";
import type { FireCMSEditorProps } from "./editor";

/**
 * `FireCMSEditor`, loaded on demand.
 *
 * The editor is built on ProseMirror — roughly 250KB across a dozen packages —
 * and is only reachable from a markdown field, which most views never render.
 * `MarkdownEditorFieldBinding` already loaded it lazily, but that split was
 * defeated by `src/index.ts` re-exporting the editor from the package barrel:
 * a static re-export puts the module back in the entry graph regardless of who
 * imports it dynamically. So ProseMirror sat in `@firecms/core` for everyone.
 *
 * The name and props are unchanged, and this component carries its own Suspense
 * boundary, so it stays a drop-in for the synchronous component it replaces —
 * a consumer rendering it without a boundary of their own still works.
 */
const LazyFireCMSEditor = React.lazy(() =>
    import("./editor").then((module) => ({ default: module.FireCMSEditor })));

export function FireCMSEditor(props: FireCMSEditorProps) {
    return (
        <React.Suspense fallback={<CircularProgressCenter/>}>
            <LazyFireCMSEditor {...props}/>
        </React.Suspense>
    );
}

FireCMSEditor.displayName = "FireCMSEditor";
