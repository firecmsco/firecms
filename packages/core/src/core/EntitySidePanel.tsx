import React, { useCallback, useEffect, useMemo } from "react";

import { EntityCollection, EntitySidePanelProps, OnUpdateParams } from "@rebasepro/types";
import { useCollectionRegistryController, useSideEntityController } from "../hooks";
import { useCMSUrlController } from "../hooks/navigation/contexts";

import { ErrorBoundary } from "../components";
import { EntityEditView } from "./EntityEditView";
import { useSideDialogContext } from "./SideDialogs";
import { CloseIcon, IconButton, OpenInFullIcon } from "@rebasepro/ui";
import { useLocation, useNavigate } from "react-router-dom";
import { saveEntityToMemoryCache } from "../util/entity_cache";

/**
 * This is the component in charge of rendering the side dialog used
 * for editing entities. Use the {@link useSideEntityController} to open
 * and control the dialogs.
 * This component needs a parent {@link Rebase}
 * {@link useSideEntityController}
 * @group Components
 */
export function EntitySidePanel(props: EntitySidePanelProps) {

    const {
        allowFullScreen = true,
        path,
        entityId,
        formProps,
    } = props;

    const {
        blocked,
        setBlocked,
        setBlockedNavigationMessage,
        close,
    } = useSideDialogContext();

    const navigate = useNavigate();
    const location = useLocation();

    const sideEntityController = useSideEntityController();
    const navigationController = useCollectionRegistryController();
    const sideDialogsController = useSideDialogContext();
    const cmsUrlController = useCMSUrlController();

    const onClose = () => {
        if (props.onClose) {
            props.onClose();
        }

        setBlocked(false);
        close(true);
    }

    const onUpdate = (params: OnUpdateParams) => {
        if (props.onUpdate) {
            props.onUpdate(params);
        }
        if (params.status !== "existing") {
            sideEntityController.replace({
                path: params.path,
                entityId: params.entityId,
                selectedTab: params.selectedTab,
                updateUrl: true,
                collection: params.collection,
            });
        }

        if (sideDialogsController.pendingClose) {
            sideDialogsController.setPendingClose(false);
            onClose();
        }

    }

    const parentCollectionIds = useMemo(() => {
        return navigationController.getParentCollectionIds(path);
    }, [navigationController, path]);

    const collection = navigationController.getCollection(path) ?? props.collection;

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

    const onValuesModified = useCallback((modified: boolean) => {
        setBlockedNavigationMessage(modified
            ? <> You have unsaved changes in this <b>{collection?.singularName ?? collection?.name}</b>.</>
            : undefined)
        setBlocked(modified);
    }, [collection?.name, setBlocked, setBlockedNavigationMessage]);

    if (!props || !collection) {
        return <div className={"w-full"} />;
    }

    return (
        <>
            <ErrorBoundary>
                <EntityEditView
                    {...props}
                    layout={"side_panel"}
                    collection={collection as EntityCollection}
                    parentCollectionIds={parentCollectionIds}
                    onValuesModified={onValuesModified}
                    onSaved={onUpdate}
                    barActions={({
                        status,
                        values
                    }) => <>
                            <IconButton
                                className="self-center"
                                size={"smallest"}
                                onClick={onClose}>
                                <CloseIcon size={"smallest"} />
                            </IconButton>
                            {allowFullScreen && <IconButton
                                className="self-center"
                                size={"smallest"}
                                onClick={() => {
                                    const key = (status === "new" || status === "copy") ? path + "#new" : path + "/" + entityId;
                                    saveEntityToMemoryCache(key, values);
                                    // Clear blocked so no unsaved-changes dialog fires
                                    setBlocked(false);
                                    setBlockedNavigationMessage(undefined);
                                    // IMPORTANT: useLocation() returns the frozen base_location from RebaseRoutes
                                    // (the collection URL), not the actual browser URL.
                                    // Build the full-screen URL directly from props using cmsUrlController.
                                    if (entityId) {
                                        const fullScreenUrl = cmsUrlController.buildUrlCollectionPath(`${path}/${entityId}`);
                                        navigate(fullScreenUrl, { state: null });
                                    } else {
                                        const fullScreenUrl = cmsUrlController.buildUrlCollectionPath(path);
                                        navigate(fullScreenUrl + "#new", { state: null });
                                    }
                                }}>
                                <OpenInFullIcon size={"smallest"} />
                            </IconButton>}
                        </>}
                    onTabChange={({
                        entityId,
                        selectedTab,
                        collection,
                    }) => {
                        sideEntityController.replace({
                            path: path,
                            entityId,
                            selectedTab,
                            updateUrl: true,
                            collection,
                        });
                    }}
                    formProps={formProps}
                />
            </ErrorBoundary>

        </>
    );
}
