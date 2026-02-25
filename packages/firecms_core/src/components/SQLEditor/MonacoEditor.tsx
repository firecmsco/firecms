import React, { useRef } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { cls } from "@firecms/ui";

export type MonacoEditorProps = {
    value: string;
    onChange: (value: string | undefined) => void;
    onRun?: () => void;
    className?: string;
    readOnly?: boolean;
    autoFocus?: boolean;
};

export const MonacoEditor = ({
    value,
    onChange,
    onRun,
    className,
    readOnly = false,
    autoFocus = true,
}: MonacoEditorProps) => {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const onRunRef = useRef(onRun);
    onRunRef.current = onRun;

    const handleEditorOnMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        editor.addAction({
            id: "run-query",
            label: "Run Query",
            keybindings: [monaco.KeyMod.CtrlCmd + monaco.KeyCode.Enter],
            contextMenuGroupId: "operation",
            contextMenuOrder: 0,
            run: () => {
                if (onRunRef.current) onRunRef.current();
            },
        });

        if (autoFocus) {
            editor.focus();
        }
    };

    return (
        <div className={cls("relative w-full h-full border border-gray-700 rounded-md overflow-hidden", className)}>
            <Editor
                height="100%"
                defaultLanguage="pgsql"
                value={value}
                onChange={onChange}
                onMount={handleEditorOnMount}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    readOnly,
                    tabSize: 2,
                    wordWrap: "on",
                }}
            />
        </div>
    );
};
