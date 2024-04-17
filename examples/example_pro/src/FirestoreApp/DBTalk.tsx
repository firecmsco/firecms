import React, { useState } from "react";
import { Button } from "@firecms/ui";

export function DBTalk() {
    const [queryText, setQueryText] = useState<string>("");
    const [results, setResults] = useState<any[]>([]);

    const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQueryText(e.target.value);
    };

    const executeQuery = async () => {
        try {
            console.log("Executing query:", queryText);

            const encodedJs = encodeURIComponent(queryText);
            const dataUri = "data:text/javascript;charset=utf-8," + encodedJs;
            const promise = import(/* @vite-ignore */dataUri);
            promise.then((module) => {
                console.log("Module loaded", module);
                module.default().then((querySnapshot: any) => {
                    console.log("Query executed")
                    const docs = querySnapshot.docs.map((doc: any) => doc.data());
                    setResults(docs);
                    console.log(docs);
                });
            });
        } catch (error) {
            console.error("Error executing query:", error);
        }
    };

    return (
        <div className={"flex flex-col p-4 gap-2"}>
            <textarea value={queryText} onChange={handleQueryChange}/>
            <Button onClick={executeQuery}>Run Query</Button>
            <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
    );
}
