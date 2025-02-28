import React, { useCallback, useEffect, useMemo } from "react";

import { EntitySidePanelProps } from "../types";
import { useNavigationController, useSideEntityController } from "../hooks";

import { ErrorBoundary } from "../components";
import { EntityEditView, OnUpdateParams } from "./EntityEditView";
import { useSideDialogContext } from "./SideDialogs";
import { CloseIcon, IconButton, OpenInFullIcon } from "@firecms/ui";
import { useLocation, useNavigate } from "react-router-dom";

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
        setBlockedNavigationMessage,
        close
    } = useSideDialogContext();

    const navigate = useNavigate();
    const location = useLocation();

    const sideEntityController = useSideEntityController();
    const navigationController = useNavigationController();
    const sideDialogsController = useSideDialogContext();

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
        return navigationController.getParentCollectionIds(props.path);
    }, [navigationController, props.path]);

    const collection = useMemo(() => {
        if (props.collection) {
            return props.collection;
        }

        const registryCollection = navigationController.getCollection(props.path);
        if (registryCollection) {
            return registryCollection;
        }

        console.error("ERROR: No collection found in path `", props.path, "`. Entity id: ", props.entityId);
        throw Error("ERROR: No collection found in path `" + props.path + "`. Make sure you have defined a collection for this path in the root navigation.");
    }, [navigationController, props.collection]);

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
        return <div className={"w-full"}/>;
    }

    return (
        <>
            <ErrorBoundary>
                <EntityEditView
                    {...props}
                    layout={"side_panel"}
                    collection={collection}
                    parentCollectionIds={parentCollectionIds}
                    onValuesModified={onValuesModified}
                    onSaved={onUpdate}
                    barActions={<>
                        <IconButton
                            className="self-center"
                            onClick={onClose}>
                            <CloseIcon size={"small"}/>
                        </IconButton>
                        <IconButton
                            className="self-center"
                            onClick={() => {
                                if (props.entityId)
                                    navigate(location.pathname);
                                else
                                    navigate(location.pathname + "#new");
                            }}>
                            <OpenInFullIcon size={"small"}/>
                        </IconButton>
                    </>}
                    onTabChange={({
                                      path,
                                      entityId,
                                      selectedTab,
                                      collection
                                  }) => {
                        sideEntityController.replace({
                            path,
                            entityId,
                            selectedTab,
                            updateUrl: true,
                            collection
                        });
                    }}
                    formProps={props.formProps}
                />
            </ErrorBoundary>

        </>
    );
}
