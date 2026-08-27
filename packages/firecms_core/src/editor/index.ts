// The editor's runtime entry point is the lazy wrapper, not the implementation:
// a static re-export here would pull ProseMirror into every consumer of
// `@firecms/core`. The types come straight from the implementation and are
// erased at build time, so they cost nothing.
export { FireCMSEditor } from "./lazy_editor";
export type {
    CustomEditorComponent,
    MarkdownEditorConfig,
    FireCMSEditorTextSize,
    FireCMSEditorProps
} from "./editor";
export * from "./types";
