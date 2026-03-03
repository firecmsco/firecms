import React, { useRef } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { cls, defaultBorderMixin } from "@firecms/ui";
import { useModeController } from "@firecms/core";

export type MonacoEditorProps = {
    value: string;
    onChange: (value: string | undefined) => void;
    onRun?: (selectedText?: string) => void;
    className?: string;
    readOnly?: boolean;
    autoFocus?: boolean;
    schemas?: Record<string, { schemaName: string, tableName: string, columns: { name: string, dataType: string }[] }[]>;
};

export const MonacoEditor = ({
    value,
    onChange,
    onRun,
    className,
    readOnly = false,
    autoFocus = true,
    schemas
}: MonacoEditorProps) => {
    const { mode } = useModeController();
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const onRunRef = useRef(onRun);
    onRunRef.current = onRun;

    const schemasRef = useRef(schemas);
    schemasRef.current = schemas;

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
                if (onRunRef.current) {
                    const selection = editor.getSelection();
                    let selectedText: string | undefined = undefined;
                    if (selection && !selection.isEmpty()) {
                        selectedText = editor.getModel()?.getValueInRange(selection)?.trim();
                    }
                    onRunRef.current(selectedText || undefined);
                }
            },
        });

        // Register custom autocomplete for tables, columns, and SQL keywords
        const sqlKeywords = [
            "SELECT", "FROM", "WHERE", "INSERT INTO", "VALUES", "UPDATE", "SET",
            "DELETE FROM", "JOIN", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN",
            "ON", "GROUP BY", "HAVING", "ORDER BY", "ASC", "DESC", "LIMIT", "OFFSET",
            "AS", "AND", "OR", "NOT", "IN", "BETWEEN", "LIKE", "IS NULL", "IS NOT NULL",
            "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "PRIMARY KEY", "FOREIGN KEY",
            "COUNT", "SUM", "AVG", "MIN", "MAX", "DISTINCT", "UNION", "ALL", "EXISTS",
            "CASE", "WHEN", "THEN", "ELSE", "END", "CAST", "COALESCE"
        ];

        monaco.languages.registerCompletionItemProvider("pgsql", {
            triggerCharacters: [".", " ", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
            provideCompletionItems: (model: any, position: any) => {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                const textUntilPosition = model.getValueInRange({
                    startLineNumber: position.lineNumber,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                });

                // Check if user is typing `tableName.`
                const match = textUntilPosition.match(/([a-zA-Z0-9_]+)\.$/);
                const tableNameMatch = match ? match[1] : null;

                const suggestions: any[] = [];
                const allSchemas = schemasRef.current || {};

                if (tableNameMatch) {
                    // Provide columns for the matched table
                    for (const [, tables] of Object.entries(allSchemas)) {
                        const table = tables.find(t => t.tableName === tableNameMatch);
                        if (table) {
                            table.columns.forEach(col => {
                                suggestions.push({
                                    label: col.name,
                                    kind: monaco.languages.CompletionItemKind.Field,
                                    insertText: col.name,
                                    range,
                                    detail: `Column`,
                                    sortText: "1"
                                });
                            });
                        }
                    }
                } else {
                    // Provide table names
                    for (const [sName, tables] of Object.entries(allSchemas)) {
                        tables.forEach(table => {
                            suggestions.push({
                                label: table.tableName,
                                kind: monaco.languages.CompletionItemKind.Class,
                                insertText: table.tableName,
                                range,
                                detail: `Table (${sName})`,
                                sortText: "2"
                            });
                        });
                    }

                    // Provide SQL keywords
                    sqlKeywords.forEach(keyword => {
                        suggestions.push({
                            label: keyword,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: keyword + " ",
                            range,
                            detail: "SQL Keyword",
                            sortText: "3"
                        });
                    });

                    // Heuristic: Suggest columns for tables that are mentioned in the current editor text
                    const fullText = model.getValue();
                    const activeTables = new Set<string>();
                    for (const [, tables] of Object.entries(allSchemas)) {
                        tables.forEach(table => {
                            const regex = new RegExp(`\\b${table.tableName}\\b`, 'i');
                            if (regex.test(fullText)) {
                                activeTables.add(table.tableName);
                            }
                        });
                    }

                    const addedColumns = new Set<string>();
                    for (const [, tables] of Object.entries(allSchemas)) {
                        tables.forEach(table => {
                            if (activeTables.has(table.tableName)) {
                                table.columns.forEach(col => {
                                    if (!addedColumns.has(col.name)) {
                                        addedColumns.add(col.name);
                                        suggestions.push({
                                            label: col.name,
                                            kind: monaco.languages.CompletionItemKind.Field,
                                            insertText: col.name,
                                            range,
                                            detail: `Column (${table.tableName})`,
                                            sortText: "1" // Prioritize columns from active tables
                                        });
                                    }
                                });
                            }
                        });
                    }
                }

                return { suggestions };

            }
        });

        if (autoFocus) {
            editor.focus();
        }
    };

    return (
        <div className={cls("relative w-full h-full overflow-hidden", className)}>
            <Editor
                height="100%"
                defaultLanguage="pgsql"
                value={value}
                onChange={onChange}
                onMount={handleEditorOnMount}
                theme={mode === "dark" ? "vs-dark" : "vs"}
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
