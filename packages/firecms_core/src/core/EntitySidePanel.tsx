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
        allowFullScreen = true,
        path,
        entityId,
        fullIdPath,
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
                fullIdPath: props.fullIdPath,
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

    const collection = navigationController.getCollection(fullIdPath ?? path) ?? props.collection;

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
                    fullIdPath={fullIdPath}
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
                        {allowFullScreen && <IconButton
                            className="self-center"
                            onClick={() => {
                                if (entityId)
                                    navigate(location.pathname);
                                else
                                    navigate(location.pathname + "#new");
                            }}>
                            <OpenInFullIcon size={"small"}/>
                        </IconButton>}
                    </>}
                    onTabChange={({
                                      entityId,
                                      selectedTab,
                                      collection,
                                  }) => {
                        sideEntityController.replace({
                            path,
                            entityId,
                            fullIdPath: props.fullIdPath,
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
