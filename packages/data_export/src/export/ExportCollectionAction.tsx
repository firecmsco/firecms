import React, { useCallback } from "react";

import {
    CollectionActionsProps,
    Entity,
    EntityCollection,
    ExportConfig,
    getDefaultValuesFor,
    resolveCollection,
    ResolvedEntityCollection,
    useAuthController,
    useCustomizationController,
    useDataSource,
    useFireCMSContext,
    useNavigationController,
    User
} from "@firecms/core";
import {
    Alert,
    BooleanSwitchWithLabel,
    Button,
    CircularProgress,
    cls,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DownloadIcon,
    IconButton,
    Tooltip
} from "@firecms/ui";
import { downloadEntitiesExport } from "./export";

const DOCS_LIMIT = 500;

export function ExportCollectionAction<M extends Record<string, any>, USER extends User>({
                                                                                             collection: inputCollection,
                                                                                             path: inputPath,
                                                                                             collectionEntitiesCount,
                                                                                             onAnalyticsEvent,
                                                                                             exportAllowed,
                                                                                             notAllowedView
                                                                                         }: CollectionActionsProps<M, USER, EntityCollection<M, any>> & {
    exportAllowed?: (props: { collectionEntitiesCount: number, path: string, collection: EntityCollection }) => boolean;
    notAllowedView?: React.ReactNode;
    onAnalyticsEvent?: (event: string, params?: any) => void;
}) {

    const customizationController = useCustomizationController();

    const exportConfig = typeof inputCollection.exportable === "object" ? inputCollection.exportable : undefined;

    const dateRef = React.useRef<Date>(new Date());

    const [includeUndefinedValues, setIncludeUndefinedValues] = React.useState<boolean>(false);
    const [flattenArrays, setFlattenArrays] = React.useState<boolean>(true);
    const [exportType, setExportType] = React.useState<"csv" | "json">("csv");
    const [dateExportType, setDateExportType] = React.useState<"timestamp" | "string">("string");

    const authController = useAuthController();
    const context = useFireCMSContext<USER>();
    const dataSource = useDataSource();
    const navigationController = useNavigationController();

    const path = navigationController.resolveIdsFrom(inputPath);

    const canExport = !exportAllowed || exportAllowed({
        collectionEntitiesCount,
        path,
        collection: inputCollection
    });

    const collection: ResolvedEntityCollection<M> = React.useMemo(() => resolveCollection({
        collection: inputCollection,
        path,
        propertyConfigs: customizationController.propertyConfigs,
        authController,
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

        onAnalyticsEvent?.("export_collection", {
            collection: collection.path
        });
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

                const dataWithDefaults = includeUndefinedValues
                    ? data.map(entity => {
                        const defaultValues = getDefaultValuesFor(collection.properties);
                        return {
                            ...entity,
                            values: { ...defaultValues, ...entity.values }
                        };
                    })
                    : data;
                downloadEntitiesExport({
                    data: dataWithDefaults,
                    additionalData,
                    properties: collection.properties,
                    propertiesOrder: collection.propertiesOrder,
                    name: collection.name,
                    flattenArrays,
                    additionalHeaders,
                    exportType,
                    dateExportType
                });
                onAnalyticsEvent?.("export_collection_success", {
                    collection: collection.path
                });
            })
            .catch((e) => {
                console.error("Error loading export data", e);
                setDataLoadingError(e);
            })
            .finally(() => setDataLoading(false));

    }, [onAnalyticsEvent, dataSource, path, fetchAdditionalFields, includeUndefinedValues, flattenArrays, exportType, dateExportType]);

    const onOkClicked = useCallback(() => {
        doDownload(collection, exportConfig);
        handleClose();
    }, [doDownload, collection, exportConfig, handleClose]);

    return <>

        <Tooltip title={"Export"}
                 asChild={true}>
            <IconButton color={"primary"} onClick={handleClickOpen}>
                <DownloadIcon/>
            </IconButton>
        </Tooltip>

        <Dialog
            open={open}
            onOpenChange={setOpen}
            maxWidth={"xl"}>

            <DialogTitle variant={"h6"}>Export data</DialogTitle>

            <DialogContent className={"flex flex-col gap-4 my-4"}>

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
                                   className={cls("w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")}/>
                            <label htmlFor="radio-csv"
                                   className="p-2 text-sm font-medium text-surface-900 dark:text-surface-accent-300">CSV</label>
                        </div>
                        <div className="flex items-center">
                            <input id="radio-json" type="radio" value="json" name="exportType"
                                   checked={exportType === "json"}
                                   onChange={() => setExportType("json")}
                                   className={cls("w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")}/>
                            <label htmlFor="radio-json"
                                   className="p-2 text-sm font-medium text-surface-900 dark:text-surface-accent-300">JSON</label>
                        </div>
                    </div>

                    <div className={"p-4 flex flex-col"}>
                        <div className="flex items-center">
                            <input id="radio-timestamp" type="radio" value="timestamp" name="dateExportType"
                                   checked={dateExportType === "timestamp"}
                                   onChange={() => setDateExportType("timestamp")}
                                   className={cls("w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")}/>
                            <label htmlFor="radio-timestamp"
                                   className="p-2 text-sm font-medium text-surface-900 dark:text-surface-accent-300">Dates
                                as
                                timestamps ({dateRef.current.getTime()})</label>
                        </div>
                        <div className="flex items-center">
                            <input id="radio-string" type="radio" value="string" name="dateExportType"
                                   checked={dateExportType === "string"}
                                   onChange={() => setDateExportType("string")}
                                   className={cls("w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")}/>
                            <label htmlFor="radio-string"
                                   className="p-2 text-sm font-medium text-surface-900 dark:text-surface-accent-300">Dates
                                as
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

                <BooleanSwitchWithLabel
                    size={"small"}
                    value={includeUndefinedValues}
                    onValueChange={setIncludeUndefinedValues}
                    label={"Include undefined values"}/>

                {!canExport && notAllowedView}

            </DialogContent>

            <DialogActions>

                {dataLoading && <CircularProgress size={"smallest"}/>}

                <Button onClick={handleClose}
                        variant={"text"}>
                    Cancel
                </Button>

                <Button variant="filled"
                        onClick={onOkClicked}
                        disabled={dataLoading || !canExport}>
                    Download
                </Button>

            </DialogActions>

        </Dialog>

    </>;
}
