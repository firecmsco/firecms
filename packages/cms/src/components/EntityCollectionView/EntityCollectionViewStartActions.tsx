import type { Properties } from "@rebasepro/types";
import type { EntityCollection } from "@rebasepro/types";
import React, { useState } from "react";
import { useAuthController, useRebaseContext, useLargeLayout, useTranslation, useSlot } from "@rebasepro/core";
import { CollectionActionsProps, EntityTableController, SelectionController } from "@rebasepro/types";
import { ErrorBoundary } from "@rebasepro/ui";
import { ClearFilterSortButton } from "../ClearFilterSortButton";
import { toArray } from "@rebasepro/common";
import { FiltersDialog } from "./FiltersDialog";
import { Badge, Button, cls, FilterListIcon, IconButton, Tooltip } from "@rebasepro/ui";

export type EntityCollectionViewStartActionsProps<M extends Record<string, any>> = {
    collection: EntityCollection<M>;
    path: string;
    relativePath: string;
    parentCollectionIds: string[];
    selectionController: SelectionController<M>;
    tableController: EntityTableController<M>;
    collectionEntitiesCount?: number;
    /**
     * Resolved properties from the collection for the filters dialog
     */
    resolvedProperties?: Properties;
}

export function EntityCollectionViewStartActions<M extends Record<string, any>>({
    collection,
    relativePath,
    parentCollectionIds,
    path,
    selectionController,
    tableController,
    collectionEntitiesCount,
    resolvedProperties
}: EntityCollectionViewStartActionsProps<M>) {

    const context = useRebaseContext();
    const largeLayout = useLargeLayout();
    const { t } = useTranslation();

    // Filters dialog state
    const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

    // Count active filters (excluding force filters)
    const filterValues = tableController.filterValues;
    const forceFilter = collection.forceFilter;
    const activeFilterCount = filterValues
        ? Object.keys(filterValues).filter(key => !forceFilter || !(key in forceFilter)).length
        : 0;

    const actionProps: CollectionActionsProps = {
        path,
        relativePath,
        parentCollectionIds,
        collection,
        selectionController,
        context,
        tableController,
        collectionEntitiesCount
    };

    // Filters button
    const filtersButton = resolvedProperties && tableController.setFilterValues && (
        <Tooltip title={t("filters")}
            key={"filters_tooltip"}>
            <Badge
                color="primary"
                invisible={activeFilterCount === 0}
            >
                {largeLayout ? (
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => setFiltersDialogOpen(true)}
                        startIcon={<FilterListIcon size="small" />}
                        className={cls(activeFilterCount > 0 && "text-primary")}
                    >
                        {t("filters")}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                    </Button>
                ) : (
                    <IconButton
                        size="small"
                        onClick={() => setFiltersDialogOpen(true)}
                        className={cls(activeFilterCount > 0 && "text-primary")}
                    >
                        <FilterListIcon size="small" />
                    </IconButton>
                )}
            </Badge>
        </Tooltip>
    );

    const actions: React.ReactNode[] = [
        filtersButton,
        <ClearFilterSortButton
            key={"clear_filter"}
            tableController={tableController}
            enabled={!collection.forceFilter} />
    ];

    const pluginActionsStart = useSlot("collection.actions.start", actionProps);

    return (
        <>
            {actions}
            {pluginActionsStart}

            {/* Filters Dialog */}
            {resolvedProperties && tableController.setFilterValues && (
                <FiltersDialog
                    open={filtersDialogOpen}
                    onOpenChange={setFiltersDialogOpen}
                    properties={resolvedProperties}
                    filterValues={tableController.filterValues}
                    setFilterValues={(filterValues) => tableController.setFilterValues?.(filterValues ?? {})}
                    forceFilter={collection.forceFilter}
                />
            )}
        </>
    );
}

