import {
    CenteredView,
    CircularProgress,
    CMSType,
    DataSource,
    Entity,
    EntityCollection,
    Typography,
    useDataSource
} from "@firecms/core";
import { useEffect, useRef, useState } from "react";
import { ImportConfig } from "../types";

export function ImportSaveInProgress<M extends { [Key: string]: CMSType }>
({
     importConfig,
     collection,
     onImportSuccess
 }:
     {
         importConfig: ImportConfig,
         collection: EntityCollection<any>,
         onImportSuccess: (collection: EntityCollection<any>) => void
     }) {

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
            importConfig.entities,
            0,
            25,
            setProcessedEntities
        ).then(() => {
            onImportSuccess(collection);
            savingRef.current = false;
        });
    }

    useEffect(() => {
        save();
    }, []);

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
                       data: Partial<Entity<any>>[],
                       offset = 0,
                       batchSize = 25,
                       onProgressUpdate: (progress: number) => void): Promise<void> {

    console.debug("Saving imported data", offset, batchSize);

    const batch = data.slice(offset, offset + batchSize);
    return Promise.all(batch.map(d =>
        dataSource.saveEntity({
            path: collection.path, // TODO: should check if this is correct, specially for subcollections
            values: d.values,
            entityId: d.id,
            collection,
            status: "new"
        })))
        .then(() => {
            if (offset + batchSize < data.length) {
                onProgressUpdate(offset + batchSize);
                return saveDataBatch(dataSource, collection, data, offset + batchSize, batchSize, onProgressUpdate);
            }
            onProgressUpdate(data.length);
            return Promise.resolve();
        });
}
