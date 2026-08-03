import React, { useCallback } from "react";

import {
    CollectionActionsProps,
    Entity,
    EntityCollection,
    ExportConfig,
    FilterValues,
    getDefaultValuesFor,
    resolveCollection,
    ResolvedEntityCollection,
    useAuthController,
    useCustomizationController,
    useDataSource,
    useFireCMSContext,
    useNavigationController,
    User,
    useTranslation
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

type ExportFilterAndSortParams<M extends Record<string, any>> = {
    filterValues?: FilterValues<Extract<keyof M, string>>;
    sortBy?: [Extract<keyof M, string>, "asc" | "desc"];
    forceFilter?: FilterValues<Extract<keyof M, string>>;
};

/**
 * A filter forced by the collection config always applies to the data the user
 * is allowed to see, so it is not something they can opt out of when exporting.
 * The toggle is therefore only worth showing when there is a filter the user
 * applied themselves, or an active sort.
 */
function hasUserFilterOrSort<M extends Record<string, any>>({
    filterValues,
    sortBy,
    forceFilter
}: ExportFilterAndSortParams<M>): boolean {
    if (sortBy) return true;
    if (!filterValues) return false;
    const forcedKeys = forceFilter ? Object.keys(forceFilter) : [];
    return Object.keys(filterValues).some((key) => !forcedKeys.includes(key));
}

/**
 * Build the `filter`, `orderBy` and `order` params passed to `fetchCollection`
 * when exporting.
 *
 * `forceFilter` is a data scoping constraint rather than a user preference, so it
 * is always applied, and it takes precedence over the filter values coming from
 * the table controller (same precedence used by the filters dialog).
 */
function resolveExportFilterAndSort<M extends Record<string, any>>({
    applyFilterAndSort,
    filterValues,
    sortBy,
    forceFilter
}: ExportFilterAndSortParams<M> & { applyFilterAndSort: boolean }): {
    filter?: FilterValues<Extract<keyof M, string>>;
    orderBy?: string;
    order?: "asc" | "desc";
} {
    const filter = {
        ...(applyFilterAndSort ? filterValues : undefined),
        ...forceFilter
    } as FilterValues<Extract<keyof M, string>>;
    return {
        filter: Object.keys(filter).length > 0 ? filter : undefined,
        orderBy: applyFilterAndSort ? sortBy?.[0] : undefined,
        order: applyFilterAndSort ? sortBy?.[1] : undefined
    };
}

export function ExportCollectionAction<M extends Record<string, any>, USER extends User>({
    collection: inputCollection,
    path: inputPath,
    pathSegments: inputPathSegments,
    collectionEntitiesCount,
    tableController,
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
    const [applyFilterAndSort, setApplyFilterAndSort] = React.useState<boolean>(true);

    // the filter and sort currently applied in the collection view
    const filterValues = tableController?.filterValues;
    const sortBy = tableController?.sortBy;
    const forceFilter = inputCollection.forceFilter;

    const filterOrSortActive = React.useMemo(() => hasUserFilterOrSort<M>({
        filterValues,
        sortBy,
        forceFilter
    }), [filterValues, sortBy, forceFilter]);

    const authController = useAuthController();
    const { t } = useTranslation();
    const context = useFireCMSContext<USER>();
    const dataSource = useDataSource();
    const navigationController = useNavigationController();

    // Resolved together so the two representations describe the same chain (see useEntityFetch).
    const pathSegments = inputPathSegments
        ? (navigationController.resolveSegmentsFrom?.(inputPathSegments) ?? inputPathSegments)
        : undefined;
    const path = navigationController.resolveIdsFrom(inputPath, inputPathSegments);

    const canExport = !exportAllowed || exportAllowed({
        collectionEntitiesCount: collectionEntitiesCount ?? 0,
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

        const {
            filter,
            orderBy,
            order
        } = resolveExportFilterAndSort<M>({
            applyFilterAndSort: filterOrSortActive && applyFilterAndSort,
            filterValues,
            sortBy,
            forceFilter
        });

        dataSource.fetchCollection<M>({
            path,
            pathSegments,
            collection,
            filter,
            orderBy,
            order
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

    }, [onAnalyticsEvent, dataSource, path, fetchAdditionalFields, includeUndefinedValues, flattenArrays, exportType, dateExportType, filterOrSortActive, applyFilterAndSort, filterValues, sortBy, forceFilter]);

    const onOkClicked = useCallback(() => {
        doDownload(collection, exportConfig);
        handleClose();
    }, [doDownload, collection, exportConfig, handleClose]);

    return <>

        <Tooltip title={t("export")}
            asChild={true}>
            <IconButton
                size={"small"}
                color={"primary"}
                onClick={handleClickOpen}>
                <DownloadIcon size={"small"} />
            </IconButton>
        </Tooltip>

        <Dialog
            open={open}
            onOpenChange={setOpen}
            maxWidth={"xl"}>

            <DialogTitle variant={"h6"}>{t("export_data")}</DialogTitle>

            <DialogContent className={"flex flex-col gap-4 my-4"}>

                <div>{t("download_table_csv")}</div>

                {collectionEntitiesCount !== undefined && collectionEntitiesCount > DOCS_LIMIT &&
                    <Alert color={"warning"}>
                        <div>
                            {t("large_number_of_documents", { count: collectionEntitiesCount.toString() })}
                        </div>
                    </Alert>}

                <div className={"flex flex-row gap-4"}>
                    <div className={"p-4 flex flex-col"}>
                        <div className="flex items-center">
                            <input id="radio-csv" type="radio" value="csv" name="exportType"
                                checked={exportType === "csv"}
                                onChange={() => setExportType("csv")}
                                className={cls("w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")} />
                            <label htmlFor="radio-csv"
                                className="p-2 text-sm font-medium text-surface-900 dark:text-surface-300">{t("csv")}</label>
                        </div>
                        <div className="flex items-center">
                            <input id="radio-json" type="radio" value="json" name="exportType"
                                checked={exportType === "json"}
                                onChange={() => setExportType("json")}
                                className={cls("w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")} />
                            <label htmlFor="radio-json"
                                className="p-2 text-sm font-medium text-surface-900 dark:text-surface-300">{t("json")}</label>
                        </div>
                    </div>

                    <div className={"p-4 flex flex-col"}>
                        <div className="flex items-center">
                            <input id="radio-timestamp" type="radio" value="timestamp" name="dateExportType"
                                checked={dateExportType === "timestamp"}
                                onChange={() => setDateExportType("timestamp")}
                                className={cls("w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")} />
                            <label htmlFor="radio-timestamp"
                                className="p-2 text-sm font-medium text-surface-900 dark:text-surface-300">{t("dates_as_timestamps")} ({dateRef.current.getTime()})</label>
                        </div>
                        <div className="flex items-center">
                            <input id="radio-string" type="radio" value="string" name="dateExportType"
                                checked={dateExportType === "string"}
                                onChange={() => setDateExportType("string")}
                                className={cls("w-4 bg-surface-100 border-surface-300 dark:bg-surface-700 dark:border-surface-600")} />
                            <label htmlFor="radio-string"
                                className="p-2 text-sm font-medium text-surface-900 dark:text-surface-300">{t("dates_as_strings")} ({dateRef.current.toISOString()})</label>
                        </div>
                    </div>
                </div>

                {filterOrSortActive && <BooleanSwitchWithLabel
                    size={"small"}
                    value={applyFilterAndSort}
                    onValueChange={setApplyFilterAndSort}
                    label={t("export_apply_filter_sort")} />}

                <BooleanSwitchWithLabel
                    size={"small"}
                    disabled={exportType !== "csv"}
                    value={flattenArrays}
                    onValueChange={setFlattenArrays}
                    label={t("flatten_arrays")} />

                <BooleanSwitchWithLabel
                    size={"small"}
                    value={includeUndefinedValues}
                    onValueChange={setIncludeUndefinedValues}
                    label={t("include_undefined_values")} />

                {!canExport && notAllowedView}

            </DialogContent>

            <DialogActions>

                {dataLoading && <CircularProgress size={"smallest"} />}

                <Button onClick={handleClose}
                    variant={"text"}>
                    {t("cancel")}
                </Button>

                <Button onClick={onOkClicked}
                    disabled={dataLoading || !canExport}>
                    {t("download")}
                </Button>

            </DialogActions>

        </Dialog>

    </>;
}
