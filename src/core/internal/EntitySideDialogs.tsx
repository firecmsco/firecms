import React from "react";
import { EntitySchema, SchemaConfig } from "../../models";
import {
    Box,
    createStyles,
    makeStyles,
    ThemeProvider
} from "@material-ui/core";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import * as locales from "date-fns/locale";
import { EntityDrawer } from "./EntityDrawer";
import EntityView from "./EntityView";
import { useCMSAppContext, useSideEntityController } from "../../contexts";
import { useSchemasRegistry } from "../../contexts/SchemaRegistry";
import { SideEntityPanelProps } from "../../models/side_panel";


export function EntitySideDialogs<S extends EntitySchema>() {

    const sideEntityController = useSideEntityController();
    const schemasRegistry = useSchemasRegistry();

    const cmsAppContext = useCMSAppContext();
    const locale = cmsAppContext.cmsAppConfig.locale;
    const theme = cmsAppContext.theme;
    const dateUtilsLocale = locale ? locales[locale] : undefined;

    const sidePanels = sideEntityController.sidePanels;
    // const [sidePanelBeingClosed, setSidePanelBeingClosed] = useState<SidePanelProps | undefined>();

    const onExitAnimation = () => {
        // setSidePanelBeingClosed(undefined);
    };

    const allPanels = [...sidePanels, undefined];

    function buildEntityView(panel: SideEntityPanelProps) {

        const schemaProps: SchemaConfig | undefined = schemasRegistry.getSchemaConfig(panel.collectionPath, panel.entityId);

        if (!schemaProps) {
            return (
                <Box>
                    ERROR: You are trying to open an entity with no schema
                    defined.
                </Box>);
        }

        return (
            <EntityView
                key={`side-form-route-${panel.entityId}`}
                {...schemaProps}
                {...panel}/>
        );
    }

    return (

        <ThemeProvider theme={theme}>
            <MuiPickersUtilsProvider
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
                                    onExitAnimation={onExitAnimation}
                                >


                                        {panel && buildEntityView(panel)}
                                </EntityDrawer>
                            );
                        })
                    }

                </DndProvider>
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    );
}

