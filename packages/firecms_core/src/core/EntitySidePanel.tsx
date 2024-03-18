import React, { useCallback, useEffect, useMemo } from "react";

import { EntitySidePanelProps } from "../types";
import { useNavigationController } from "../hooks";

import { ErrorBoundary } from "../components";
import { EntityEditView } from "./EntityEditView";
import { useSideDialogContext } from "./SideDialogs";

/**
 * This is the component in charge of rendering the side dialog used
 * for editing entities. Use the {@link useSideEntityController} to open
 * and control the dialogs.
 * This component needs a parent {@link FireCMS}
 * {@link useSideEntityController}
 * @group Components
 */
export function EntitySidePanel(props: EntitySidePanelProps) {

    const {
        blocked,
        setBlocked,
        setBlockedNavigationMessage
    } = useSideDialogContext();

    const navigationController = useNavigationController();

    const parentCollectionIds = useMemo(() => {
        return navigationController.getParentCollectionIds(props.path);
    }, [navigationController, props.path]);

    const collection = useMemo(() => {
        if (!props) return undefined;
        let usedCollection = props.collection;

        const registryCollection = navigationController.getCollection(props.path, props.entityId);
        if (registryCollection) {
            usedCollection = registryCollection;
        }
        if (!usedCollection) {
            console.error("ERROR: No collection found in path `", props.path, "`. Entity id: ", props.entityId);
            throw Error("ERROR: No collection found in path `" + props.path + "`. Make sure you have defined a collection for this path in the root navigation.");
        }

        return usedCollection;
    }, [navigationController, props]);

    useEffect(() => {
        function beforeunload(e: any) {
            if (blocked && collection) {
                e.preventDefault();
                e.returnValue = `You have unsaved changes in this ${collection.name}. Are you sure you want to leave this page?`;
            }
        }

        if (typeof window !== "undefined")
            window.addEventListener("beforeunload", beforeunload);

        return () => {
            if (typeof window !== "undefined")
                window.removeEventListener("beforeunload", beforeunload);
        };

    }, [blocked, collection]);

    const onValuesAreModified = useCallback((modified: boolean) => {
        setBlocked(modified);
        setBlockedNavigationMessage(modified
            ? <> You have unsaved changes in this <b>{collection?.singularName ?? collection?.name}</b>.</>
            : undefined)
    }, [collection?.name, setBlocked, setBlockedNavigationMessage]);

    if (!props || !collection) {
        return <div className={"w-full"}/>;
    }

    return (
        <>
            <ErrorBoundary>
                <EntityEditView
                    {...props}
                    formWidth={props.width}
                    collection={collection}
                    parentCollectionIds={parentCollectionIds}
                    onValuesAreModified={onValuesAreModified}
                />
            </ErrorBoundary>

        </>
    );
}
