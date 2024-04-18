import React, { useState } from "react";
import * as firestoreLibrary from "firebase/firestore";
import { doc, DocumentReference, getFirestore, setDoc } from "firebase/firestore";
import { cmsToFirestoreModel, firestoreToCMSModel, getPropertiesFromData } from "@firecms/firebase";
import {
    CircularProgressCenter,
    Entity,
    EntityCollectionTable,
    OnCellValueChange,
    Properties,
    useSelectionController
} from "@firecms/core";
import { setIn } from "@firecms/formex";
import { Button, cn, Paper, TextareaAutosize } from "@firecms/ui";

// @ts-ignore
window.firestoreLibrary = firestoreLibrary

const sampleQuery = `export default async () => {
const productsRef = collection(getFirestore(), "products");
return getDocs(query(productsRef, where("price", ">", 500)));
}`;

export function CodeBlock({ initialCode }: { initialCode?: string }) {

    const textAreaRef = React.useRef<HTMLDivElement>(null);
    const [queryText, setQueryText] = useState<string | undefined>(initialCode);

    const [loading, setLoading] = useState<boolean>(false);
    const [queryResults, setQueryResults] = useState<Entity<any>[] | null>(null);
    const [properties, setProperties] = useState<Properties | null>(null);
    const [executionResult, setExecutionResult] = useState<any | null>();
    const [codeHasBeenRun, setCodeHasBeenRun] = useState<boolean>(false);

    const [executionError, setExecutionError] = useState<Error | null>(null);

    const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQueryText(e.target.value);
    };

    async function displayQuerySnapshotData(querySnapshot: firestoreLibrary.QuerySnapshot) {
        const docs = querySnapshot.docs.map((doc: any) => doc.data());
        const inferredProperties = await getPropertiesFromData(docs);
        const entities = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            path: doc.ref.path,
            values: firestoreToCMSModel(doc.data())
        }));
        setQueryResults(entities);
        setProperties(inferredProperties);
    }

    const executeQuery = async () => {

        setCodeHasBeenRun(true);
        setTimeout(() => {
            textAreaRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            })
        }, 100);

        if (!queryText) {
            return;
        }

        setLoading(true);
        setExecutionError(null);

        try {
            console.log("Executing query:", queryText);

            const encodedJs = encodeURIComponent(queryText);
            const dataUri = "data:text/javascript;charset=utf-8," + buildAuxScript() + encodedJs;
            const promise = import(/* @vite-ignore */dataUri);
            promise.then((module) => {
                console.log("Module loaded", module);
                module.default()
                    .then(async (codePromise: any) => {
                        console.log("Query loaded", codePromise, typeof codePromise);
                        const codeResult = await codePromise;
                        if (codeResult instanceof firestoreLibrary.QuerySnapshot) {
                            return displayQuerySnapshotData(codeResult);
                        } else if (typeof codePromise === "undefined") {
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
                    });
            })
                .catch((error) => {
                    setExecutionError(error);
                    console.error("Error loading module:", error);
                    setLoading(false);
                });
        } catch (error: any) {
            setLoading(false);
            setExecutionError(error);
            console.error("Error executing query:", error);
        }
    };

    const onValueChange: OnCellValueChange<any, any> = ({
                                                            fullPath,
                                                            context,
                                                            value,
                                                            propertyKey,
                                                            onValueUpdated,
                                                            setError,
                                                            entity
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

    return (
        <div className={"flex flex-col my-4 gap-2 "}>

            <div className={"flex flex-row w-full gap-4"}
                 ref={textAreaRef}>
                <TextareaAutosize
                    className={"bg-gray-100 dark:bg-gray-900 flex-1 p-4 font-mono text-sm resize-none rounded-lg border-none focus:ring-0 dark:text-gray-300"}
                    value={queryText} onChange={handleQueryChange}/>
                <Button size="small"
                        variant={codeHasBeenRun ? "outlined" : "filled"}
                        onClick={executeQuery} disabled={!queryText}>Run Code</Button>
            </div>

            {executionError && (
                <div className={"w-full text-sm bg-red-100 dark:bg-red-800 p-4 rounded-lg"}>
                    <code className={"text-red-700 dark:text-red-300"}>{executionError.message}</code>
                </div>
            )}

            {(queryResults || loading || executionResult) && (
                <div className={cn("w-full rounded-lg shadow-sm overflow-hidden transition-all", {
                    "h-[400px]": queryResults,
                    "h-[92px]": loading || executionResult
                })}>
                    {loading && <CircularProgressCenter/>}
                    {queryResults && properties && <EntityCollectionTable
                        inlineEditing={true}
                        defaultSize={"s"}
                        selectionController={selectionController}
                        onValueChange={onValueChange}
                        tableController={{
                            data: queryResults,
                            dataLoading: false,
                            noMoreToLoad: true
                        }}
                        properties={properties}/>}

                    {executionResult && (
                        <Paper className={"w-full p-4 min-h-[92px]"}>
                            {typeof executionResult === "string"
                                ? executionResult
                                : <pre className={"text-sm font-mono text-gray-700 dark:text-gray-300"}>
                                {JSON.stringify(executionResult, null, 2)}
                            </pre>}
                        </Paper>
                    )}
                </div>
            )}
        </div>
    );
}

function buildAuxScript() {
    return `${Object.keys(firestoreLibrary).map(key => `const ${key} = window.firestoreLibrary.${key};`).join("\n")}\n`;
}

console.log(Object.keys(firestoreLibrary))
