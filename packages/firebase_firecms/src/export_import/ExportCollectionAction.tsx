import React, { useCallback } from "react";

import {
    Alert,
    BooleanSwitchWithLabel,
    Button,
    CircularProgress,
    cn,
    CollectionActionsProps,
    Dialog,
    DialogActions,
    DialogContent,
    Entity,
    focusedMixin,
    GetAppIcon,
    IconButton,
    resolveCollection,
    ResolvedEntityCollection,
    Tooltip,
    Typography,
    useDataSource,
    useFireCMSContext,
    useNavigationContext,
    User
} from "@firecms/core";
import { downloadExport } from "./export";
import { ExportConfig } from "../types/export_import";
import { SubscriptionPlanWidget } from "../components";
import { useProjectConfig } from "../hooks";
import { FirebaseCMSCollection } from "../types/collections";

const DOCS_LIMIT = 500;

export function ExportCollectionAction<M extends Record<string, any>, UserType extends User>({
                                                                                                 collection: inputCollection,
                                                                                                 path: inputPath,
                                                                                                 collectionEntitiesCount
                                                                                             }: CollectionActionsProps<M, UserType, FirebaseCMSCollection<M, any>>) {
    const { canExport } = useProjectConfig();

    const exportConfig = typeof inputCollection.exportable === "object" ? inputCollection.exportable : undefined;

    const dateRef = React.useRef<Date>(new Date());
    const [flattenArrays, setFlattenArrays] = React.useState<boolean>(true);
    const [exportType, setExportType] = React.useState<"csv" | "json">("csv");
    const [dateExportType, setDateExportType] = React.useState<"timestamp" | "string">("string");

    const context = useFireCMSContext<UserType>();
    const dataSource = useDataSource();
    const navigationContext = useNavigationContext();

    const path = navigationContext.resolveAliasesFrom(inputPath);

    const exportNotAllowed = !canExport && collectionEntitiesCount > DOCS_LIMIT;

    const collection: ResolvedEntityCollection<M> = React.useMemo(() => resolveCollection({
        collection: inputCollection,
        path,
        fields: context.fields
    }), [inputCollection, path]);

    const [dataLoading, setDataLoading] = React.useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = React.useState<Error | undefined>();

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const fetchAdditionalFields = useCallback(async (entities: Entity<M>[]) => {

        const additionalExportFields = exportConfig?.additionalFields;
        const additionalFields = collection.additionalFields;

        const resolvedExportColumnsValues: Record<string, any>[] = additionalExportFields
            ? await Promise.all(entities.map(async (entity) => {
                return (await Promise.all(additionalExportFields.map(async (column) => {
                    return {
                        [column.key]: await column.builder({
                            entity,
                            context
                        })
                    };
                }))).reduce((a, b) => ({ ...a, ...b }), {});
            }))
            : [];

        const resolvedColumnsValues: Record<string, any>[] = additionalFields
            ? await Promise.all(entities.map(async (entity) => {
                return (await Promise.all(additionalFields
                    .map(async (field) => {
                        if (!field.value)
                            return {};
                        return {
                            [field.key]: await field.value({
                                entity,
                                context
                            })
                        };
                    }))).reduce((a, b) => ({ ...a, ...b }), {});
            }))
            : [];
        return [...resolvedExportColumnsValues, ...resolvedColumnsValues];
    }, [exportConfig?.additionalFields]);

    const doDownload = useCallback(async (collection: ResolvedEntityCollection<M>,
                                          exportConfig: ExportConfig<any> | undefined) => {

        setDataLoading(true);
        dataSource.fetchCollection<M>({
            path,
            collection
        })
            .then(async (data) => {
                setDataLoadingError(undefined);
                const additionalData = await fetchAdditionalFields(data);
                const additionalHeaders = [
                    ...exportConfig?.additionalFields?.map(column => column.key) ?? [],
                    ...collection.additionalFields?.map(field => field.key) ?? []
                ];
                downloadExport(data, additionalData, collection, flattenArrays, additionalHeaders, exportType, dateExportType);
            })
            .catch(setDataLoadingError)
            .finally(() => setDataLoading(false));

    }, [dataSource, path, fetchAdditionalFields, flattenArrays, exportType, dateExportType]);

    const onOkClicked = useCallback(() => {
        doDownload(collection, exportConfig);
        handleClose();
    }, [doDownload, collection, exportConfig, handleClose]);

    return <>

        <Tooltip title={"Export"}>
            <IconButton color={"primary"} onClick={handleClickOpen}>
                <GetAppIcon/>
            </IconButton>
        </Tooltip>

        <Dialog
            open={open}
            onOpenChange={setOpen}
            maxWidth={"xl"}>
            <DialogContent className={"flex flex-col gap-4 my-4"}>

                <Typography variant={"h6"}>Export data</Typography>

                <div>Download the the content of this table as a CSV</div>

                {collectionEntitiesCount > DOCS_LIMIT &&
                    <Alert color={"warning"}>
                        <div>
                            This collections has a large number
                            of documents ({collectionEntitiesCount}).
                        </div>
                    </Alert>}

                <div className={"flex flex-row gap-4"}>
                    <div className={"p-4 flex flex-col"}>
                        <div className="flex items-center">
                            <input id="radio-csv" type="radio" value="csv" name="exportType"
                                   checked={exportType === "csv"}
                                   onChange={() => setExportType("csv")}
                                   className={cn(focusedMixin, "w-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600")}/>
                            <label htmlFor="radio-csv"
                                   className="p-2 text-sm font-medium text-gray-900 dark:text-gray-300">CSV</label>
                        </div>
                        <div className="flex items-center">
                            <input id="radio-json" type="radio" value="json" name="exportType"
                                   checked={exportType === "json"}
                                   onChange={() => setExportType("json")}
                                   className={cn(focusedMixin, "w-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600")}/>
                            <label htmlFor="radio-json"
                                   className="p-2 text-sm font-medium text-gray-900 dark:text-gray-300">JSON</label>
                        </div>
                    </div>

                    <div className={"p-4 flex flex-col"}>
                        <div className="flex items-center">
                            <input id="radio-timestamp" type="radio" value="timestamp" name="dateExportType"
                                   checked={dateExportType === "timestamp"}
                                   onChange={() => setDateExportType("timestamp")}
                                   className={cn(focusedMixin, "w-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600")}/>
                            <label htmlFor="radio-timestamp"
                                   className="p-2 text-sm font-medium text-gray-900 dark:text-gray-300">Dates as
                                timestamps ({dateRef.current.getTime()})</label>
                        </div>
                        <div className="flex items-center">
                            <input id="radio-string" type="radio" value="string" name="dateExportType"
                                   checked={dateExportType === "string"}
                                   onChange={() => setDateExportType("string")}
                                   className={cn(focusedMixin, "w-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600")}/>
                            <label htmlFor="radio-string"
                                   className="p-2 text-sm font-medium text-gray-900 dark:text-gray-300">Dates as
                                strings ({dateRef.current.toISOString()})</label>
                        </div>
                    </div>
                </div>

                <BooleanSwitchWithLabel
                    size={"small"}
                    disabled={exportType !== "csv"}
                    value={flattenArrays}
                    onValueChange={setFlattenArrays}
                    label={"Flatten arrays"}/>

                {exportNotAllowed && <SubscriptionPlanWidget showForPlans={["free"]}
                                                             message={`Upgrade to export more than ${DOCS_LIMIT} entities`}/>}

            </DialogContent>

            <DialogActions>

                {dataLoading && <CircularProgress size={"small"}/>}

                <Button onClick={handleClose}
                        variant={"text"}>
                    Cancel
                </Button>

                <Button variant="filled"
                        onClick={onOkClicked}
                        disabled={dataLoading || exportNotAllowed}>
                    Download
                </Button>

            </DialogActions>

        </Dialog>

    </>;
}