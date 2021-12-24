import React, { useMemo, useState } from "react";
import {
    EntityCollectionResolver,
    EntitySchema,
    EntitySchemaResolver,
    SideEntityPanelProps
} from "../models";
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

    if (!props) {
        return <SideDialogDrawer
            open={false}
            offsetPosition={offsetPosition}>
            <div style={{ width: CONTAINER_WIDTH }}/>
        </SideDialogDrawer>;
    }

    const {
        path,
        entityId,
    } = props;

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

    let viewProps = { ...props };
    let schema = viewProps.schema;
    if (!schema) {
        const schemaProps: EntityCollectionResolver | undefined = navigationContext.getCollectionResolver(path, entityId);
        viewProps = { ...schemaProps, ...viewProps };
        schema = schemaProps?.schemaResolver;
    }

    if (!schema) {
        throw Error("ERROR: You are trying to open an entity with no schema defined.");
    }

    const computedSchema = useMemo(() => computeSchema({
        schemaOrResolver: schema as EntitySchema | EntitySchemaResolver,
        path: path,
        entityId: entityId,
    }), [path, entityId, schema]);

    return (
        <>

            <SideDialogDrawer
                open={props !== undefined}
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
                         {...viewProps}
                         schema={schema}
                         onModifiedValues={setModifiedValues}
                     />
                </ErrorBoundary>
            </SideDialogDrawer>

            <UnsavedChangesDialog
                open={navigationWasBlocked || drawerCloseRequested}
                handleOk={drawerCloseRequested ? handleDrawerCloseOk : handleNavigationOk}
                handleCancel={drawerCloseRequested ? handleDrawerCloseCancel : handleNavigationCancel}
                schemaName={computedSchema.name}/>

        </>
    );
}

