import React from "react";
import { useCustomizationController, useFireCMSContext } from "../../hooks";
import { CollectionActionsProps, EntityCollection, EntityTableController, SelectionController } from "../../types";
import { toArray } from "../../util/arrays";
import { ErrorBoundary } from "../ErrorBoundary";

export type EntityCollectionViewStartActionsProps<M extends Record<string, any>> = {
    collection: EntityCollection<M>;
    path: string;
    relativePath: string;
    parentCollectionIds: string[];
    selectionController: SelectionController<M>;
    tableController: EntityTableController<M>;
    collectionEntitiesCount: number;
}

export function EntityCollectionViewStartActions<M extends Record<string, any>>({
                                                                                    collection,
                                                                                    relativePath,
                                                                                    parentCollectionIds,
                                                                                    path,
                                                                                    selectionController,
                                                                                    tableController,
                                                                                    collectionEntitiesCount
                                                                                }: EntityCollectionViewStartActionsProps<M>) {

    const context = useFireCMSContext();

    const customizationController = useCustomizationController();
    const plugins = customizationController.plugins ?? [];

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

    const actions: React.ReactNode[] = [];

    if (plugins) {
        plugins.forEach((plugin, i) => {
            if (plugin.collectionView?.CollectionActionsStart) {
                actions.push(...toArray(plugin.collectionView?.CollectionActionsStart)
                    .map((Action, j) => (
                        <ErrorBoundary key={`plugin_actions_${i}_${j}`}>
                            <Action {...actionProps} {...plugin.collectionView?.collectionActionsStartProps}/>
                        </ErrorBoundary>
                    )));
            }
        });
    }

    return (
        <>
            {actions}
        </>
    );
}
