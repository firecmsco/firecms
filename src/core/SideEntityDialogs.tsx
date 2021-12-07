import React, { useState } from "react";
import { EntityCollectionResolver, SideEntityPanelProps } from "../models";
import { SideDialogDrawer } from "./internal/SideDialogDrawer";
import { EntityView } from "./internal/EntityView";
import { CONTAINER_WIDTH } from "./internal/common";
import { useNavigation, useSideEntityController } from "../hooks";
import { ErrorBoundary } from "./internal/ErrorBoundary";
import {
    UnsavedChangesDialog,
    useNavigationUnsavedChangesDialog
} from "./internal/useUnsavedChangesDialog";
import { computeSchema } from "./utils";

/**
 * This is the component in charge of rendering the side dialogs used
 * for editing entities. Use the {@link useSideEntityController} to open
 * and control the dialogs.
 * This component needs a parent {@link FireCMS}
 * {@see useSideEntityController}
 * @category Components
 */
export function SideEntityDialogs<M extends { [Key: string]: any }>() {

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
                        panel={panel}
                        offsetPosition={sidePanels.length - index - 1}/>

                ))
        }
    </>;
}

function SideEntityDialog({
                              panel,
                              offsetPosition
                          }: { panel?: SideEntityPanelProps, offsetPosition: number }) {

    if (!panel) {
        return <SideDialogDrawer
            open={false}
            offsetPosition={offsetPosition}>
            <div style={{ width: CONTAINER_WIDTH }}/>
        </SideDialogDrawer>;
    }
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
    const navigationContext = useNavigation();
    const schemaProps: EntityCollectionResolver | undefined = navigationContext.getCollectionResolver(panel.path, panel.entityId);
    if (!schemaProps) {
        throw Error("ERROR: You are trying to open an entity with no schema defined.");
    }

    const schema = computeSchema({
        schemaOrResolver: schemaProps.schemaResolver,
        path : panel.path,
        entityId:panel.entityId,
    });

    return (
        <>

            <SideDialogDrawer
                open={panel !== undefined}
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
                        {...schemaProps}
                        {...panel}
                        schema={schemaProps.schemaResolver}
                        onModifiedValues={setModifiedValues}
                    />
                </ErrorBoundary>
            </SideDialogDrawer>

            <UnsavedChangesDialog
                open={navigationWasBlocked || drawerCloseRequested}
                handleOk={drawerCloseRequested ? handleDrawerCloseOk : handleNavigationOk}
                handleCancel={drawerCloseRequested ? handleDrawerCloseCancel : handleNavigationCancel}
                schemaName={schema.name}/>

        </>
    );
}

