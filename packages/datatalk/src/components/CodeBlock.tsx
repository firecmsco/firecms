import React, { useEffect, useState } from "react";
import * as firestoreLibrary from "@firebase/firestore";
import { CircularProgressCenter, EntityCollection } from "@firecms/core";
import { Button, cls, Paper, useDebounceValue } from "@firecms/ui";
import { AutoHeightEditor } from "./AutoHeightEditor";
import { extractStringLiterals } from "../utils/extract_literals";
import { TableResults } from "./TableResults";

// @ts-ignore
window.firestoreLibrary = firestoreLibrary

function ExecutionErrorView(props: { executionError: Error }) {
    const message = props.executionError.message;
    const urlRegex = /https?:\/\/[^\s]+/g;
    const htmlContent = message.replace(urlRegex, (url) => {
        // For each URL found, replace it with an HTML <a> tag
        return `<a href="${url}" target="_blank" class="underline">LINK</a><br/>`;
    });

    return <div className={"w-full text-sm bg-red-100 dark:bg-red-800 p-4 rounded-lg"}>
        <code className={"text-red-700 dark:text-red-300 break-all"} dangerouslySetInnerHTML={{ __html: htmlContent }}/>
    </div>;
}

export function CodeBlock({
                              initialCode,
                              maxWidth,
                              loading,
                              sourceLoading,
                              onCodeModified,
                              autoRunCode,
                              onCodeRun,
                              collections
                          }: {
    initialCode?: string,
    sourceLoading?: boolean,
    loading?: boolean,
    maxWidth?: number,
    autoRunCode?: boolean,
    onCodeModified?: (code: string) => void,
    onCodeRun?: () => void,
    collections?: EntityCollection[]
}) {

    const textAreaRef = React.useRef<HTMLDivElement>(null);
    const [code, setCode] = useState<string | undefined>(initialCode);

    const [loadingQuery, setLoadingQuery] = useState<boolean>(false);
    const [querySnapshot, setQuerySnapshot] = useState<firestoreLibrary.QuerySnapshot | null>(null);
    const [codePriorityKeys, setCodePriorityKeys] = useState<string[] | undefined>();

    const [executionResult, setExecutionResult] = useState<any | null>();
    const [codeHasBeenRun, setCodeHasBeenRun] = useState<boolean>(false);
    const [consoleOutput, setConsoleOutput] = useState<string>("");

    const [executionError, setExecutionError] = useState<Error | null>(null);
    const mounted = React.useRef(false);

    const deferredCode = useDebounceValue(code, 500);
    useEffect(() => {
        if (onCodeModified) {
            onCodeModified(deferredCode ?? "");
        }
    }, [deferredCode]);

    useEffect(() => {
        setCode(initialCode);
        if (autoRunCode && !mounted.current && initialCode && !sourceLoading) {
            executeQuery();
        }
        mounted.current = true;
    }, [sourceLoading, initialCode, autoRunCode]);

    const handleCodeChange = (value?: string) => {
        setCode(value);
    };

    async function displayQuerySnapshotData(querySnapshot: firestoreLibrary.QuerySnapshot, priorityKeys?: string[]) {
        if (querySnapshot.empty) {
            setQuerySnapshot(null);
            setExecutionResult("No documents found");
            return;
        }
        setQuerySnapshot(querySnapshot);
        setCodePriorityKeys(priorityKeys);
    }

    const executeQuery = async () => {

        if (!code) {
            return;
        }

        originalConsoleLog("Executing code", code);

        setCodeHasBeenRun(true);

        setLoadingQuery(true);
        setExecutionError(null);

        try {
            pipeConsoleLog((...args) => {
                setConsoleOutput((prev) => prev + Array.from(args).join(" ") + "\n");
            });
            const encodedJs = encodeURIComponent(code);
            const dataUri = "data:text/javascript;charset=utf-8," + buildAuxScript() + encodedJs;
            const promise = import(/* @vite-ignore */dataUri);
            promise.then((module) => {
                originalConsoleLog("Module loaded", module);
                setConsoleOutput("");
                if (!module.default) {
                    setExecutionError(new Error("No default export found. Make sure your code is exporting a default function."));
                    setLoadingQuery(false);
                    return;
                }
                module.default()
                    .then(async (codeOutput: any) => {
                        originalConsoleLog("Code loaded", codeOutput, typeof codeOutput);
                        let codeResult;
                        if (codeOutput instanceof Promise) {
                            codeResult = await codeOutput;
                        } else if (typeof codeOutput === "function") {
                            codeResult = await codeOutput();
                        } else {
                            codeResult = codeOutput;
                        }

                        if (codeResult instanceof firestoreLibrary.QuerySnapshot) {
                            const priorityKeys = extractStringLiterals(code);
                            return displayQuerySnapshotData(codeResult, priorityKeys);
                        } else if (codeResult instanceof firestoreLibrary.DocumentReference) {
                            return setExecutionResult("Document added successfully with reference: " + codeResult.path);
                        } else if (codeResult instanceof firestoreLibrary.DocumentSnapshot) {
                            const res = JSON.stringify(codeResult.data(), null, 2);
                            originalConsoleLog("Document data", res);
                            return setExecutionResult(res);
                        } else if (typeof codeOutput === "undefined") {
                            return setExecutionResult("Code executed successfully");
                        } else {
                            return setExecutionResult(codeResult);
                        }
                    })
                    .catch((error: any) => {
                        setExecutionError(error);
                        originalConsoleError("Error executing query:", error);
                    })
                    .finally(() => {
                        setLoadingQuery(false);
                        onCodeRun?.();
                        resetConsolePipe();
                    });
            })
                .catch((error) => {
                    setExecutionError(error);
                    originalConsoleError("Error loading module:", error);
                    setLoadingQuery(false);
                    resetConsolePipe();
                });
        } catch (error: any) {
            setLoadingQuery(false);
            setExecutionError(error);
            console.error("Error executing query:", error);
        }
    };

    return (
        <div className={"flex flex-col my-4 gap-2"}
             style={{
                 maxWidth: maxWidth ? maxWidth + "px" : undefined
             }}>

            <div className={"flex flex-row w-full gap-4"}
                 ref={textAreaRef}>
                <AutoHeightEditor
                    value={code}
                    loading={loading}
                    maxWidth={maxWidth ? maxWidth - 96 : undefined}
                    onChange={handleCodeChange}
                />
                <Button size="small"
                        variant={codeHasBeenRun ? "outlined" : "filled"}
                        onClick={executeQuery}
                        disabled={!code}>Run Code</Button>
            </div>

            {executionError && (
                <ExecutionErrorView executionError={executionError}/>
            )}

            {(querySnapshot || loadingQuery || consoleOutput || executionResult) && (
                <div
                    style={{
                        marginLeft: querySnapshot ? "-64px" : undefined,
                        width: querySnapshot ? "calc(100% + 64px)" : undefined
                    }}
                    className={cls("w-full rounded-lg shadow-sm overflow-hidden transition-all", {
                        "h-[480px]": querySnapshot,
                        "h-[92px]": !querySnapshot && loadingQuery
                    })}>
                    {loadingQuery && <CircularProgressCenter/>}

                    {querySnapshot && <TableResults querySnapshot={querySnapshot}
                                                    priorityKeys={codePriorityKeys}
                                                    collections={collections}/>}

                    {(consoleOutput || executionResult) && (
                        <Paper className={"w-full p-4 min-h-[92px] font-mono text-xs overflow-auto rounded-lg"}>
                            {consoleOutput && <pre className={"text-sm font-mono text-surface-700 dark:text-surface-200"}>
                                {consoleOutput}
                            </pre>}
                            {executionResult && <pre className={"text-xs font-mono text-surface-700 dark:text-surface-200"}>
                                    {typeof executionResult === "string" ? executionResult : JSON.stringify(executionResult, null, 2)}
                            </pre>}
                        </Paper>
                    )}
                </div>
            )}

        </div>
    );
}

const originalConsoleDebug = console.debug;
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

function resetConsolePipe() {
    console.debug = originalConsoleDebug;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
}

function pipeConsoleLog(onConsoleLog: (...message: any) => void) {
    console.debug = function (message) {
        onConsoleLog(message);
        originalConsoleDebug(message);
    };
    console.log = function (message) {
        onConsoleLog(message);
        originalConsoleLog(message);
    };
    console.error = function (message) {
        onConsoleLog(message);
        originalConsoleError(message);
    };
    console.warn = function (message) {
        onConsoleLog(message);
        originalConsoleWarn(message);
    };
    console.info = function (message) {
        onConsoleLog(message);
        originalConsoleInfo(message);
    };
}

function buildAuxScript() {
    return `${Object.keys(firestoreLibrary).map(key => `const ${key} = window.firestoreLibrary.${key};`).join("\n")}\n`;
}
