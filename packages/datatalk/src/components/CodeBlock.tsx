import React, { useEffect, useState } from "react";
import * as firestoreLibrary from "firebase/firestore";
import { doc, DocumentReference, getFirestore, setDoc } from "firebase/firestore";
import { cmsToFirestoreModel, firestoreToCMSModel } from "@firecms/firebase";
import {
    CircularProgressCenter,
    Entity,
    EntityCollectionTable,
    OnCellValueChange,
    Properties,
    useSelectionController
} from "@firecms/core";
import { setIn } from "@firecms/formex";
import { Button, cn, Paper, Typography } from "@firecms/ui";
import { buildPropertiesOrder } from "@firecms/schema_inference";
import { AutoHeightEditor } from "./AutoHeightEditor";
import { getPropertiesFromData } from "@firecms/collection_editor_firebase";
import { BasicExportAction } from "@firecms/data_import_export";

// @ts-ignore
window.firestoreLibrary = firestoreLibrary

const sampleQuery = `export default async () => {
const productsRef = collection(getFirestore(), "products");
return getDocs(query(productsRef, where("price", ">", 500)));
}`;

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
                              autoRunCode
                          }: {
    initialCode?: string,
    maxWidth?: number,
    autoRunCode?: boolean
}) {

    const textAreaRef = React.useRef<HTMLDivElement>(null);
    const [inputCode, setInputCode] = useState<string | undefined>(initialCode);

    const [loading, setLoading] = useState<boolean>(false);
    const [queryResults, setQueryResults] = useState<Entity<any>[] | null>(null);
    const [properties, setProperties] = useState<Properties | null>(null);
    const [propertiesOrder, setPropertiesOrder] = useState<string[] | null>(null);
    const [executionResult, setExecutionResult] = useState<any | null>();
    const [codeHasBeenRun, setCodeHasBeenRun] = useState<boolean>(false);
    const [consoleOutput, setConsoleOutput] = useState<string>("");

    const [executionError, setExecutionError] = useState<Error | null>(null);
    const mounted = React.useRef(false);

    useEffect(() => {
        if (autoRunCode && !mounted.current && initialCode) {
            executeQuery();
        }
        mounted.current = true;
    }, []);

    const handleCodeChange = (value?: string) => {
        setInputCode(value);
    };

    async function displayQuerySnapshotData(querySnapshot: firestoreLibrary.QuerySnapshot) {
        const docs = querySnapshot.docs.map((doc: any) => doc.data());
        const inferredProperties = await getPropertiesFromData(docs);
        const inferredPropertiesOrder = buildPropertiesOrder(inferredProperties);
        const entities = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            path: doc.ref.path,
            values: firestoreToCMSModel(doc.data())
        }));
        setQueryResults(entities);
        setProperties(inferredProperties);
        setPropertiesOrder(inferredPropertiesOrder)
    }

    const executeQuery = async () => {

        if (!inputCode) {
            return;
        }

        setCodeHasBeenRun(true);

        setLoading(true);
        setExecutionError(null);

        try {
            channelConsole((...args) => {
                setConsoleOutput((prev) => prev + Array.from(args).join(" ") + "\n");
            });
            const encodedJs = encodeURIComponent(inputCode);
            const dataUri = "data:text/javascript;charset=utf-8," + buildAuxScript() + encodedJs;
            const promise = import(/* @vite-ignore */dataUri);
            promise.then((module) => {
                originalConsoleLog("Module loaded", module);
                setConsoleOutput("");
                if (!module.default) {
                    setExecutionError(new Error("No default export found. Make sure your code is exporting a default function."));
                    setLoading(false);
                    return;
                }
                module.default()
                    .then(async (codeExport: any) => {
                        originalConsoleLog("Code loaded", codeExport, typeof codeExport);
                        let codeResult;
                        if (codeExport instanceof Promise) {
                            codeResult = await codeExport;
                        } else if (typeof codeExport === "function") {
                            codeResult = await codeExport();
                        } else {
                            codeResult = codeExport;
                        }

                        if (codeResult instanceof firestoreLibrary.QuerySnapshot) {
                            return displayQuerySnapshotData(codeResult);
                        } else if (typeof codeExport === "undefined") {
                            return setExecutionResult("Code executed successfully");
                        } else {
                            return setExecutionResult(codeResult);
                        }
                    })
                    .catch((error: any) => {
                        setExecutionError(error);
                        console.error("Error executing query:", error);
                    })
                    .finally(() => {
                        setLoading(false);
                        setTimeout(() => {
                            textAreaRef.current?.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            })
                        }, 100);
                    });
            })
                .catch((error) => {
                    setExecutionError(error);
                    console.error("Error loading module:", error);
                    setLoading(false);
                })
                .finally(() => {
                    resetConsole();
                });
        } catch (error: any) {
            setLoading(false);
            setExecutionError(error);
            console.error("Error executing query:", error);
        }
    };

    const onValueChange: OnCellValueChange<any, any> = ({
                                                            value,
                                                            propertyKey,
                                                            onValueUpdated,
                                                            setError,
                                                            data: entity
                                                        }) => {

        const updatedValues = setIn({ ...entity.values }, propertyKey, value);

        const firestore = getFirestore();
        const firebaseValues = cmsToFirestoreModel(updatedValues, firestore);
        console.log("Saving", firebaseValues, entity);
        console.log("Firestore", firestore);
        const documentReference: DocumentReference = doc(firestore, entity.path);
        console.log("Document reference", documentReference)
        return setDoc(documentReference, firebaseValues, { merge: true })
            .then((res) => {
                console.log("Document updated", res);
                onValueUpdated();
            })
            .catch((error) => {
                console.error("Error updating document", error);
                setError(error);
            });

    };

    const selectionController = useSelectionController();
    const displayedColumnIds = (propertiesOrder ?? Object.keys(properties ?? {}))
        .map((key) => ({
            key,
            disabled: false
        }));

    return (
        <div className={"flex flex-col my-4 gap-2 "}>

            <div className={"flex flex-row w-full gap-4"}
                 ref={textAreaRef}>
                <AutoHeightEditor
                    value={inputCode}
                    maxWidth={maxWidth ? maxWidth - 96 : undefined}
                    onChange={handleCodeChange}
                />
                <Button size="small"
                        variant={codeHasBeenRun ? "outlined" : "filled"}
                        onClick={executeQuery}
                        disabled={!inputCode}>Run Code</Button>
            </div>

            {executionError && (
                <ExecutionErrorView executionError={executionError}/>
            )}

            {(queryResults || loading) && (
                <div className={cn("w-full rounded-lg shadow-sm overflow-hidden transition-all", {
                    "h-[480px]": queryResults,
                    "h-[92px]": !queryResults && loading
                })}>
                    {loading && <CircularProgressCenter/>}

                    {queryResults && properties && <EntityCollectionTable
                        inlineEditing={true}
                        defaultSize={"s"}
                        selectionController={selectionController}
                        onValueChange={onValueChange}
                        filterable={false}
                        actionsStart={<Typography
                            variant={"caption"}>{(queryResults ?? []).length} results</Typography>}
                        actions={<BasicExportAction
                            data={queryResults}
                            properties={properties}
                            propertiesOrder={propertiesOrder ?? undefined}
                        />}
                        sortable={false}
                        tableController={{
                            data: queryResults,
                            dataLoading: false,
                            noMoreToLoad: true
                        }}
                        displayedColumnIds={displayedColumnIds}
                        properties={properties}/>}

                </div>
            )}
            {(consoleOutput || executionResult) && (
                <Paper className={"w-full p-4 min-h-[92px] font-mono text-sm overflow-auto"}>
                    {consoleOutput && <pre className={"text-sm font-mono text-gray-700 dark:text-gray-300"}>
                                {consoleOutput}
                            </pre>}
                    {executionResult && (typeof executionResult === "string"
                        ? executionResult
                        : <pre className={"text-sm font-mono text-gray-700 dark:text-gray-300"}>
                                {JSON.stringify(executionResult, null, 2)}
                            </pre>)}
                </Paper>
            )}
        </div>
    );
}

const originalConsoleLog = console.log;

function resetConsole() {
    console.log = originalConsoleLog;
}

function channelConsole(onConsoleLog: (...message: any) => void) {
    console.log = function (message) {
        onConsoleLog(message);
        originalConsoleLog(message);
    };
}

function buildAuxScript() {
    return `${Object.keys(firestoreLibrary).map(key => `const ${key} = window.firestoreLibrary.${key};`).join("\n")}\n`;
}

console.log(Object.keys(firestoreLibrary))
