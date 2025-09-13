import { DataSource, Entity, EntityCollection, useDataSource } from "@firecms/core";
import { Button, CenteredView, CircularProgress, Typography, } from "@firecms/ui";
import { useEffect, useRef, useState } from "react";
import { ImportConfig } from "../types";

export function ImportSaveInProgress<C extends EntityCollection>
({
     path,
     importConfig,
     collection,
     onImportSuccess
 }:
     {
         path: string,
         importConfig: ImportConfig,
         collection: C,
         onImportSuccess: (collection: C) => void
     }) {

    const [errorSaving, setErrorSaving] = useState<Error | undefined>(undefined);
    const dataSource = useDataSource();

    const savingRef = useRef<boolean>(false);

    const [processedEntities, setProcessedEntities] = useState<number>(0);

    function save() {

        if (savingRef.current)
            return;

        savingRef.current = true;

        saveDataBatch(
            dataSource,
            collection,
            path,
            importConfig.entities,
            0,
            25,
            setProcessedEntities
        ).then(() => {
            onImportSuccess(collection);
            savingRef.current = false;
        }).catch((e) => {
            setErrorSaving(e);
            savingRef.current = false;
        });
    }

    useEffect(() => {
        save();
    }, []);

    if (errorSaving) {
        return (
            <CenteredView className={"flex flex-col gap-4 items-center"}>
                <Typography variant={"h6"}>
                    Error saving data
                </Typography>

                <Typography variant={"body2"} color={"error"}>
                    {errorSaving.message}
                </Typography>
                <Button
                    onClick={save}
                    variant={"outlined"}>
                    Retry
                </Button>
            </CenteredView>
        );
    }

    return (
        <CenteredView className={"flex flex-col gap-4 items-center"}>
            <CircularProgress/>

            <Typography variant={"h6"}>
                Saving data
            </Typography>

            <Typography variant={"body2"}>
                {processedEntities}/{importConfig.entities.length} entities saved
            </Typography>

            <Typography variant={"caption"}>
                Do not close this tab or the import will be interrupted.
            </Typography>

        </CenteredView>
    );

}

function saveDataBatch(dataSource: DataSource,
                       collection: EntityCollection,
                       path: string,
                       data: Partial<Entity<any>>[],
                       offset = 0,
                       batchSize = 25,
                       onProgressUpdate: (progress: number) => void): Promise<void> {

    console.debug("Saving imported data", offset, batchSize);

    const batch = data.slice(offset, offset + batchSize);
    return Promise.all(batch.map(d =>
        dataSource.saveEntity({
            path: path,
            values: d.values,
            entityId: d.id,
            collection,
            status: "new"
        })))
        .then(() => {
            if (offset + batchSize < data.length) {
                onProgressUpdate(offset + batchSize);
                return saveDataBatch(dataSource, collection, path, data, offset + batchSize, batchSize, onProgressUpdate);
            }
            onProgressUpdate(data.length);
            return Promise.resolve();
        });
}
