import React, { useState } from "react";
import { useCustomizationController, useFireCMSContext, useLargeLayout } from "../../hooks";
import {
    CollectionActionsProps,
    EntityCollection,
    EntityTableController,
    ResolvedProperty,
    SelectionController
} from "../../types";
import { toArray } from "../../util/arrays";
import { ErrorBoundary } from "../ErrorBoundary";
import { ClearFilterSortButton } from "../ClearFilterSortButton";
import { FiltersDialog } from "./FiltersDialog";
import { Badge, Button, cls, FilterListIcon, IconButton, Tooltip } from "@firecms/ui";

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
    resolvedProperties?: Record<string, ResolvedProperty>;
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

    const context = useFireCMSContext();
    const customizationController = useCustomizationController();
    const plugins = customizationController.plugins ?? [];
    const largeLayout = useLargeLayout();

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
        <Tooltip title="Filters"
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
                        Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
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

    if (plugins) {
        plugins.forEach((plugin, i) => {
            if (plugin.collectionView?.CollectionActionsStart) {
                actions.push(...toArray(plugin.collectionView?.CollectionActionsStart)
                    .map((Action, j) => (
                        <ErrorBoundary key={`plugin_actions_${i}_${j}`}>
                            <Action {...actionProps} {...plugin.collectionView?.collectionActionsStartProps} />
                        </ErrorBoundary>
                    )));
            }
        });
    }

    return (
        <>
            {actions}

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

