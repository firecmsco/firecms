import React, { useEffect, useMemo, useState } from "react";
import { EntityCollection, SideEntityPanelProps } from "../models";
import { SideDialogDrawer } from "./internal/SideDialogDrawer";
import { EntityView } from "./internal/EntityView";
import { CONTAINER_WIDTH } from "./internal/common";
import { useNavigationContext, useSideEntityController } from "../hooks";
import { ErrorBoundary } from "./internal/ErrorBoundary";
import {
    UnsavedChangesDialog,
    useNavigationUnsavedChangesDialog
} from "./internal/useUnsavedChangesDialog";

/**
 * This is the component in charge of rendering the side dialogs used
 * for editing entities. Use the {@link useSideEntityController} to open
 * and control the dialogs.
 * This component needs a parent {@link FireCMS}
 * {@see useSideEntityController}
 * @category Components
 */
export function SideEntityDialogs() {

    const sideEntityController = useSideEntityController();

    const sidePanels = sideEntityController.sidePanels;

    //  we add an extra closed drawer, that it is used to maintain the transition when a drawer is removed
    const allPanels = [...sidePanels, undefined];

    return <>
        {
            allPanels.map((panel: SideEntityPanelProps | undefined, index) =>
                (
                    <SideEntityDialog
                        key={`side_entity_dialog_${index}`}
                        props={panel}
                        offsetPosition={sidePanels.length - index - 1}/>

                ))
        }
    </>;
}

function SideEntityDialog({
                              props,
                              offsetPosition
                          }: { props?: SideEntityPanelProps, offsetPosition: number }) {

    // have the original values of the form changed?
    const [modifiedValues, setModifiedValues] = useState(false);
    // was the closing of the dialog requested by the drawer
    const [drawerCloseRequested, setDrawerCloseRequested] = useState(false);

    const {
        navigationWasBlocked,
        handleOk: handleNavigationOk,
        handleCancel: handleNavigationCancel
    } = useNavigationUnsavedChangesDialog(
        modifiedValues && !drawerCloseRequested,
        () => setModifiedValues(false)
    );

    const handleDrawerCloseOk = () => {
        setModifiedValues(false);
        setDrawerCloseRequested(false);
        sideEntityController.close();
    };
    const handleDrawerCloseCancel = () => {
        setDrawerCloseRequested(false);
    };

    const sideEntityController = useSideEntityController();
    const navigationContext = useNavigationContext();

    const collection = useMemo(() => {
        if (!props) return undefined;
        let usedCollection = props.collection;
        if (!usedCollection) {
            usedCollection = !props ? undefined : navigationContext.getCollection(props.path, props.entityId);
            if (!usedCollection) {
                console.error("ERROR: No collection found in path ", props.path, "Entity id: ", props.entityId);
                throw Error("ERROR: No collection found in path " + props.path);
            }
        }
        return usedCollection;
    }, [props]);

    useEffect(() => {
        function beforeunload(e: any) {
            if (modifiedValues && collection) {
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

    }, [modifiedValues, collection, window]);

    if (!props || !collection) {
        return <SideDialogDrawer
            open={false}
            offsetPosition={offsetPosition}>
            <div style={{ width: CONTAINER_WIDTH }}/>
        </SideDialogDrawer>;
    }

    return (
        <>

            <SideDialogDrawer
                open={Boolean(props)}
                onClose={() => {
                    if (modifiedValues) {
                        setDrawerCloseRequested(true);
                    } else {
                        sideEntityController.close();
                    }
                }}
                offsetPosition={offsetPosition}
            >
                <ErrorBoundary>
                    <EntityView
                        {...props}
                        collection={collection}
                        onModifiedValues={setModifiedValues}
                    />
                </ErrorBoundary>
            </SideDialogDrawer>

            <UnsavedChangesDialog
                open={navigationWasBlocked || drawerCloseRequested}
                handleOk={drawerCloseRequested ? handleDrawerCloseOk : handleNavigationOk}
                handleCancel={drawerCloseRequested ? handleDrawerCloseCancel : handleNavigationCancel}
                name={collection.name}/>

        </>
    );
}
