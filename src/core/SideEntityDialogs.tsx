import React from "react";
import { SchemaConfig, SideEntityPanelProps } from "../models";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateFnsUtils from "@date-io/date-fns";
import * as locales from "date-fns/locale";
import { EntityDrawer } from "./internal/EntityDrawer";
import { SideEntityView } from "./internal/SideEntityView";
import { CONTAINER_WIDTH } from "./internal/common";
import { useFireCMSContext, useSideEntityController } from "../hooks";
import { ErrorBoundary } from "./internal/ErrorBoundary";

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
    const schemaRegistryController = useFireCMSContext().schemaRegistryController;

    const context = useFireCMSContext();

    const locale = context.locale;
    const dateUtilsLocale = locale ? locales[locale] : undefined;

    const sidePanels = sideEntityController.sidePanels;

    const allPanels = [...sidePanels, undefined];

    function buildEntityView(panel: SideEntityPanelProps) {

        const schemaProps: SchemaConfig | undefined = schemaRegistryController.getSchemaConfig(panel.path, panel.entityId);

        if (!schemaProps) {
            throw Error("ERROR: You are trying to open an entity with no schema defined.");
        }

        return (
            <ErrorBoundary>
                <SideEntityView
                    key={`side-entity-view-${panel.entityId}`}
                    {...schemaProps}
                    {...panel}/>
            </ErrorBoundary>
        );
    }

    return (
        <LocalizationProvider
            dateAdapter={AdapterDateFns}
            utils={DateFnsUtils}
            locale={dateUtilsLocale}>
            <DndProvider backend={HTML5Backend}>
                {/* we add an extra closed drawer, that it is used to maintain the transition when a drawer is removed */}
                {
                    allPanels.map((panel: SideEntityPanelProps | undefined, index) => {
                        return (
                            <EntityDrawer
                                key={`side_menu_${index}`}
                                open={panel !== undefined}
                                onClose={() => {
                                    sideEntityController.close();
                                }}
                                offsetPosition={sidePanels.length - index - 1}
                            >

                                {panel && buildEntityView(panel)}

                                {!panel &&
                                <div style={{ width: CONTAINER_WIDTH }}/>}

                            </EntityDrawer>
                        );
                    })
                }

            </DndProvider>
        </LocalizationProvider>
    );
}

