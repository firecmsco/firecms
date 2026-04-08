import { RebaseEditor } from "@rebasepro/core";

const sampleContent = `# Getting Started with Rebase

Rebase is a **code-first** framework for building admin panels. Unlike traditional CMS platforms, your schema lives in TypeScript files that you control.

> Ship your back-office in a sprint. Extend it forever.

## Quick Setup

\`\`\`typescript
const rebase = createRebaseClient(config);
\`\`\`

- Auto-generated REST & GraphQL APIs
- Schema-aware AI completions built in
- Custom React views and field widgets

| Feature | Status |
|---|---|
| Rich Text Editor | ✓ |
| File Uploads | ✓ |
| Data Import/Export | ✓ |
`;

export function RebaseEditorDemo() {
    const handleImageUpload = async (file: File): Promise<string> => {
        return URL.createObjectURL(file);
    };

    return (
        <div
            className="bg-surface-950 rounded-xl border border-surface-800 overflow-hidden"
        >
            <div className="prose prose-sm prose-invert dark:prose-invert max-w-none
                prose-headings:text-white prose-headings:font-sans prose-headings:font-medium
                prose-p:text-surface-300
                prose-strong:text-white
                prose-blockquote:text-surface-400 prose-blockquote:border-primary/40
                prose-code:text-primary-light prose-code:bg-surface-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-surface-900 prose-pre:border prose-pre:border-surface-700/50 prose-pre:rounded-lg
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-th:text-surface-300 prose-td:text-surface-400
                prose-table:border-surface-700
                prose-hr:border-surface-700
                prose-li:text-surface-300
                [&_.ProseMirror]:min-h-[350px] [&_.ProseMirror]:p-6 [&_.ProseMirror]:focus:outline-none
            ">
                <RebaseEditor
                    content={sampleContent}
                    handleImageUpload={handleImageUpload}
                    textSize="sm"
                />
            </div>
        </div>
    );
}
