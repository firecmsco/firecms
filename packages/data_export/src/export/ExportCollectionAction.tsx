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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DownloadIcon,
    IconButton,
    LoadingButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from "@firecms/ui";
import { downloadEntitiesExport } from "./export";
import { fetchSelectedEntities } from "./selected_entities";

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
    selectionController,
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
    const [exportScope, setExportScope] = React.useState<"all" | "selected">("all");

    const selectedEntities = selectionController?.selectedEntities ?? [];
    const exportSelected = exportScope === "selected" && selectedEntities.length > 0;
    const showLargeCollectionWarning = !exportSelected && collectionEntitiesCount !== undefined && collectionEntitiesCount > DOCS_LIMIT;

    // the filter and sort currently applied in the collection view
    const filterValues = tableController?.filterValues;
    const sortBy = tableController?.sortBy;
    const forceFilter = inputCollection.forceFilter;

    const filterOrSortActive = React.useMemo(() => hasUserFilterOrSort<M>({
        filterValues,
        sortBy,
        forceFilter
    }), [filterValues, sortBy, forceFilter]);
    const showFilterToggle = !exportSelected && filterOrSortActive;

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

    // Incremented by every export and every close: an export that is no longer the latest
    // (the dialog was closed while it ran) neither downloads its file nor reports its error.
    const exportRunRef = React.useRef(0);

    const handleClickOpen = useCallback(() => {
        // rows selected before opening are the likelier intent, so they are the default
        setExportScope(selectedEntities.length > 0 ? "selected" : "all");
        setDataLoadingError(undefined);
        setOpen(true);
    }, [setOpen, selectedEntities.length]);

    const handleClose = useCallback(() => {
        exportRunRef.current++;
        setDataLoading(false);
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

    /**
     * Fetch the data and download the file.
     * Resolves to whether the file was downloaded; a failure is kept in `dataLoadingError`.
     */
    const doDownload = useCallback(async (collection: ResolvedEntityCollection<M>,
        exportConfig: ExportConfig<any> | undefined): Promise<boolean> => {

        onAnalyticsEvent?.("export_collection", {
            collection: collection.path,
            scope: exportSelected ? "selected" : "all"
        });
        const run = ++exportRunRef.current;
        setDataLoadingError(undefined);
        setDataLoading(true);

        try {
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

            const data = exportSelected
                ? await fetchSelectedEntities<M>({
                    dataSource,
                    selectedEntities,
                    tableData: tableController?.data,
                    collection,
                    path,
                    pathSegments
                })
                : await dataSource.fetchCollection<M>({
                    path,
                    pathSegments,
                    collection,
                    filter,
                    orderBy,
                    order
                });

            const additionalData = await fetchAdditionalFields(data);
            if (run !== exportRunRef.current) return false;

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
            return true;
        } catch (e) {
            console.error("Error loading export data", e);
            if (run === exportRunRef.current)
                setDataLoadingError(e instanceof Error ? e : new Error(String(e)));
            return false;
        } finally {
            if (run === exportRunRef.current)
                setDataLoading(false);
        }

    }, [onAnalyticsEvent, dataSource, path, pathSegments, fetchAdditionalFields, includeUndefinedValues, flattenArrays, exportType, dateExportType, filterOrSortActive, applyFilterAndSort, filterValues, sortBy, forceFilter, exportSelected, selectedEntities, tableController?.data]);

    const onOkClicked = useCallback(async () => {
        // the dialog stays open while the export runs, and after a failure to show it
        if (await doDownload(collection, exportConfig))
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
            onOpenChange={(open) => open ? setOpen(true) : handleClose()}
            maxWidth={"xl"}>

            <DialogTitle variant={"h6"}>{t("export_data")}</DialogTitle>

            <DialogContent className={"flex flex-col gap-6 my-4"}>

                {/* first, so the reason comes before the options it makes unusable */}
                {!canExport && notAllowedView}

                {/* Which entities: only rendered when there is a choice or a caveat */}
                {(selectedEntities.length > 0 || showFilterToggle || showLargeCollectionWarning) &&
                    <div className={"flex flex-col gap-2"}>
                        {selectedEntities.length > 0 && <ToggleButtonGroup
                            fullWidth={true}
                            value={exportSelected ? "selected" : "all"}
                            onValueChange={setExportScope}
                            options={[
                                { value: "all", label: t("export_all_entities") },
                                { value: "selected", label: t("export_selected_entities", { count: selectedEntities.length.toString() }) }
                            ]} />}

                        {showFilterToggle && <BooleanSwitchWithLabel
                            size={"small"}
                            value={applyFilterAndSort}
                            onValueChange={setApplyFilterAndSort}
                            label={t("export_apply_filter_sort")} />}

                        {showLargeCollectionWarning && <Alert color={"warning"} size={"small"}>
                            {t("large_number_of_documents", { count: String(collectionEntitiesCount) })}
                        </Alert>}
                    </div>}

                {/* The file format, and the option that only applies to CSV */}
                <div className={"flex flex-col gap-2"}>
                    <ToggleButtonGroup
                        fullWidth={true}
                        value={exportType}
                        onValueChange={setExportType}
                        options={[
                            { value: "csv", label: t("csv") },
                            { value: "json", label: t("json") }
                        ]} />

                    {exportType === "csv" && <BooleanSwitchWithLabel
                        size={"small"}
                        value={flattenArrays}
                        onValueChange={setFlattenArrays}
                        label={t("flatten_arrays")} />}
                </div>

                {/* How values are written */}
                <div className={"flex flex-col gap-2"}>
                    <div className={"flex flex-col gap-1"}>
                        <ToggleButtonGroup
                            fullWidth={true}
                            value={dateExportType}
                            onValueChange={setDateExportType}
                            options={[
                                { value: "string", label: t("dates_as_strings") },
                                { value: "timestamp", label: t("dates_as_timestamps") }
                            ]} />
                        {/* how a date will read in the file */}
                        <Typography variant={"caption"} color={"secondary"} className={"px-1 font-mono tabular-nums"}>
                            {dateExportType === "string" ? dateRef.current.toISOString() : dateRef.current.getTime()}
                        </Typography>
                    </div>

                    <BooleanSwitchWithLabel
                        size={"small"}
                        value={includeUndefinedValues}
                        onValueChange={setIncludeUndefinedValues}
                        label={t("include_undefined_values")} />
                </div>

                {/* last, next to the Download button that produced it */}
                {dataLoadingError && <Alert color={"error"}>
                    {t("export_error", { message: dataLoadingError.message })}
                </Alert>}

            </DialogContent>

            <DialogActions>

                <Button onClick={handleClose}
                    variant={"text"}>
                    {t("cancel")}
                </Button>

                <LoadingButton onClick={onOkClicked}
                    color={"primary"}
                    loading={dataLoading}
                    disabled={!canExport}>
                    {t("download")}
                </LoadingButton>

            </DialogActions>

        </Dialog>

    </>;
}
