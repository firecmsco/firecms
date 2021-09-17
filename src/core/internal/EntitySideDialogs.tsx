import React from "react";
import { SchemaConfig } from "../../models";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DateFnsUtils from "@date-io/date-fns";
import * as locales from "date-fns/locale";
import { EntityDrawer } from "./EntityDrawer";
import EntityView from "./EntityView";
import { useCMSAppContext, useSideEntityController } from "../../contexts";
import { useSchemasRegistry } from "../../contexts/SchemaRegistry";
import { SideEntityPanelProps } from "../SideEntityPanelProps";
import { CONTAINER_WIDTH } from "./common";


export function EntitySideDialogs<M extends { [Key: string]: any }>() {

    const sideEntityController = useSideEntityController();
    const schemasRegistry = useSchemasRegistry();

    const context = useCMSAppContext();
    const locale = context.locale;
    const dateUtilsLocale = locale ? locales[locale] : undefined;

    const sidePanels = sideEntityController.sidePanels;

    const allPanels = [...sidePanels, undefined];

    function buildEntityView(panel: SideEntityPanelProps) {

        const schemaProps: SchemaConfig | undefined = schemasRegistry.getSchemaConfig(panel.path, panel.entityId);

        if (!schemaProps) {
            throw Error("ERROR: You are trying to open an entity with no schema defined.");
        }

        return (
            <EntityView
                key={`side-form-route-${panel.entityId}`}
                {...schemaProps}
                {...panel}/>
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

