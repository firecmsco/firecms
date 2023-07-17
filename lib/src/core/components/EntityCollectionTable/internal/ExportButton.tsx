import React, { useCallback, useEffect, useRef } from "react";

import { Entity, EntityCollection, ExportConfig, ResolvedEntityCollection, User } from "../../../../types";
import { useDataSource, useFireCMSContext, useNavigationContext } from "../../../../hooks";
import { downloadCSV } from "../../../util/csv";
import { DialogActions } from "../../DialogActions";
import { resolveCollection } from "../../../util";
import { Button, CircularProgress, Dialog, IconButton, Tooltip, Typography } from "../../../../components";
import { Alert } from "@mui/lab";
import { GetAppIcon } from "../../../../icons";

interface ExportButtonProps<M extends Record<string, any>, UserType extends User> {
    collection: EntityCollection<M>;
    path: string;
    exportConfig?: ExportConfig<UserType>;
}

const INITIAL_DOCUMENTS_LIMIT = 200;

export function ExportButton<M extends Record<string, any>, UserType extends User>({
                                                                                       collection: inputCollection,
                                                                                       path: inputPath,
                                                                                       exportConfig
                                                                                   }: ExportButtonProps<M, UserType>
) {

    const context = useFireCMSContext<UserType>();
    const dataSource = useDataSource();
    const navigationContext = useNavigationContext();

    const path = navigationContext.resolveAliasesFrom(inputPath);

    const collection: ResolvedEntityCollection<M> = React.useMemo(() => resolveCollection({
        collection: inputCollection,
        path,
        fields: context.fields
    }), [inputCollection, path]);

    const dataRef = useRef<Entity<M>[]>();
    const additionalDataRef = useRef<Record<string, any>[]>();

    const [dataLoading, setDataLoading] = React.useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = React.useState<Error | undefined>();

    // If in the initial load, we get more than INITIAL_DOCUMENTS_LIMIT results
    const [hasLargeAmountOfData, setHasLargeAmountOfData] = React.useState<boolean>(false);

    // did the user agree to export a large amount of data
    const [fetchLargeDataAccepted, setFetchLargeDataAccepted] = React.useState<boolean>(false);

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const doDownload = useCallback((data: Entity<M>[] | undefined,
                                    additionalData: Record<string, any>[] | undefined,
                                    collection: ResolvedEntityCollection<M>,
                                    path: string,
                                    exportConfig: ExportConfig<any> | undefined) => {
        if (!data)
            throw Error("Trying to perform export without loading data first");

        downloadCSV(data, additionalData, collection, path, exportConfig);
    }, []);

    const fetchAdditionalFields = useCallback(async (entities: Entity<M>[]) => {

        if (!exportConfig?.additionalFields) {
            return;
        }

        const additionalFields = exportConfig.additionalFields;

        const resolvedColumnsValues: Record<string, any>[] = await Promise.all(entities.map(async (entity) => {
            return (await Promise.all(additionalFields.map(async (column) => {
                return {
                    [column.key]: await column.builder({
                        entity,
                        context
                    })
                };
            }))).reduce((a, b) => ({ ...a, ...b }), {});
        }));
        return resolvedColumnsValues;
    }, [exportConfig?.additionalFields]);

    const updateEntities = useCallback(async (entities: Entity<M>[]) => {
        if (entities.length >= INITIAL_DOCUMENTS_LIMIT) {
            setHasLargeAmountOfData(true);
        }

        const pendingDownload = dataRef.current && entities.length > dataRef.current.length && fetchLargeDataAccepted;

        dataRef.current = entities;
        const additionalFieldsData = await fetchAdditionalFields(entities);
        additionalDataRef.current = additionalFieldsData;
        setDataLoadingError(undefined);

        if (pendingDownload) {
            doDownload(entities, additionalFieldsData, collection, path, exportConfig);
            handleClose();
        }
    }, [collection, doDownload, exportConfig, fetchAdditionalFields, fetchLargeDataAccepted, handleClose, path]);

    useEffect(() => {

        if (!open) return;

        setDataLoading(true);
        dataSource.fetchCollection<M>({
            path,
            collection,
            limit: fetchLargeDataAccepted ? undefined : INITIAL_DOCUMENTS_LIMIT
        })
            .then(updateEntities)
            .catch(setDataLoadingError)
            .finally(() => setDataLoading(false));

    }, [collection, dataSource, fetchLargeDataAccepted, open, path, updateEntities]);

    const needsToAcceptFetchAllData = hasLargeAmountOfData && !fetchLargeDataAccepted;

    const onOkClicked = useCallback(() => {
        if (needsToAcceptFetchAllData) {
            setFetchLargeDataAccepted(true);
        } else {
            doDownload(dataRef.current, additionalDataRef.current, collection, path, exportConfig);
            handleClose();
        }
    }, [needsToAcceptFetchAllData, doDownload, collection, path, exportConfig, handleClose]);

    return <>

        <Tooltip title={"Export"}>
            <IconButton color={"primary"} onClick={handleClickOpen}>
                <GetAppIcon/>
            </IconButton>
        </Tooltip>

        <Dialog
            open={open}
            onOpenChange={setOpen}
        >
            <div className={"p-4"}>

                <Typography variant={"h6"}>Export data</Typography>

                <>Download the the content of this table as a CSV</>
                <br/>

                {needsToAcceptFetchAllData &&
                    <Alert elevation={3}
                           variant="filled"
                           severity={"warning"}>
                        <div>
                            This collections has a large number
                            of documents (more
                            than {INITIAL_DOCUMENTS_LIMIT}).
                        </div>
                        <div>
                            Would you like to proceed?
                        </div>

                    </Alert>}
            </div>

            <DialogActions>

                {dataLoading && <CircularProgress size={"small"}/>}

                <Button onClick={handleClose} variant={"text"}>
                    Cancel
                </Button>

                <Button variant="filled"
                        disabled={dataLoading}
                        onClick={onOkClicked}>
                    Download
                </Button>

            </DialogActions>

        </Dialog>

    </>;
}
