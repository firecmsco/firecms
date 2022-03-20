import React, { useCallback, useEffect, useRef } from "react";
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip
} from "@mui/material";

import GetAppIcon from "@mui/icons-material/GetApp";
import {
    Entity,
    EntityCollection,
    ExportConfig,
    ResolvedEntityCollection
} from "../../../../models";
import { useDataSource, useFireCMSContext } from "../../../../hooks";
import { downloadCSV } from "../../../util/csv";
import { CustomDialogActions } from "../../CustomDialogActions";
import { getResolvedCollection } from "../../../useBuildCollectionRegistry";

interface ExportButtonProps<M extends { [Key: string]: any }, UserType> {
    collection: EntityCollection<M>;
    path: string;
    exportConfig?: ExportConfig<UserType>;
}

const INITIAL_DOCUMENTS_LIMIT = 200;

export function ExportButton<M extends { [Key: string]: any }, UserType>({
                                                                             collection: inputCollection,
                                                                             path,
                                                                             exportConfig
                                                                         }: ExportButtonProps<M, UserType>
) {

    const dataSource = useDataSource();
    const context = useFireCMSContext();

    const collection:ResolvedEntityCollection<M> = React.useMemo(() => getResolvedCollection({
        collection: inputCollection,
        path
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
                                    exportConfig: ExportConfig | undefined) => {
        if (!data)
            throw Error("Trying to perform export without loading data first");

        downloadCSV(data, additionalData, collection, path, exportConfig);
    }, []);

    useEffect(() => {

        if (!open) return;

        setDataLoading(true);

        const updateEntities = async (entities: Entity<M>[]) => {
            if (entities.length >= INITIAL_DOCUMENTS_LIMIT) {
                setHasLargeAmountOfData(true);
            }

            const pendingDownload = dataRef.current && entities.length > dataRef.current.length && fetchLargeDataAccepted;

            dataRef.current = entities;
            const additionalColumnsData = await fetchAdditionalColumns(entities);
            additionalDataRef.current = additionalColumnsData;
            setDataLoading(false);
            setDataLoadingError(undefined);

            if (pendingDownload) {
                doDownload(entities, additionalColumnsData, collection, path, exportConfig);
                handleClose();
            }
        };

        const fetchAdditionalColumns = async (entities: Entity<M>[]) => {

            if (!exportConfig?.additionalColumns) {
                return;
            }

            const additionalColumns = exportConfig.additionalColumns;

            const resolvedColumnsValues: Record<string, any>[] = await Promise.all(entities.map(async (entity) => {
                return (await Promise.all(additionalColumns.map(async (column) => {
                    return {
                        [column.key]: await column.builder({
                            entity,
                            context
                        })
                    };
                }))).reduce((a, b) => ({ ...a, ...b }), {});
            }));
            return resolvedColumnsValues;
        };

        const onFetchError = (error: Error) => {
            console.error("ERROR", error);
            setDataLoading(false);
            setDataLoadingError(error);
        };

        dataSource.fetchCollection<M>({
            path,
            collection,
            limit: fetchLargeDataAccepted ? undefined : INITIAL_DOCUMENTS_LIMIT
        })
            .then(updateEntities)
            .catch(onFetchError);

    }, [path, fetchLargeDataAccepted, collection, open, dataSource, doDownload, exportConfig, handleClose, context]);

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
            keepMounted={false}
            open={open}
            onClose={handleClose}
        >
            <DialogTitle>Export data</DialogTitle>

            <DialogContent>
                <DialogContentText>

                    <div>Download the the content of this table as a CSV
                    </div>
                    <br/>

                    {needsToAcceptFetchAllData &&
                    <Alert elevation={1}
                              variant="filled"
                              severity={"warning"}>
                        <div>
                            This collections has a large number
                            of documents (more than {INITIAL_DOCUMENTS_LIMIT}).
                        </div>
                        <div>
                            Would you like to proceed?
                        </div>

                    </Alert>}

                </DialogContentText>
            </DialogContent>

            <CustomDialogActions>

                {dataLoading && <CircularProgress size={16} thickness={8}/>}

                <Button color="primary" onClick={handleClose}>
                    Cancel
                </Button>

                <Button color="primary"
                        variant="contained"
                        disabled={dataLoading}
                        onClick={onOkClicked}>
                    Download
                </Button>

            </CustomDialogActions>

        </Dialog>

    </>;
}

