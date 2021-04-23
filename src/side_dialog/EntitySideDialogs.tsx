import React from "react";
import { EntityCollection, EntitySchema, SchemaConfig } from "../models";
import { Box, createStyles, makeStyles } from "@material-ui/core";
import { EntityDrawer } from "./EntityDrawer";
import EntityView from "./EntityView";
import { useSideEntityController } from "../contexts";
import { useSchemasRegistry } from "../contexts/SchemaRegistry";
import { SideEntityPanelProps } from "./model";

export const useStyles = makeStyles(theme => createStyles({
    root: {
        width: "45vw",
        height: "100%",
        maxWidth: "1000px",
        [theme.breakpoints.down("md")]: {
            width: "60vw"
        },
        [theme.breakpoints.down("sm")]: {
            width: "85vw"
        },
        [theme.breakpoints.down("xs")]: {
            width: "100vw"
        },
        transition: "width 155ms cubic-bezier(0.33, 1, 0.68, 1)"
    },
    wide: {
        width: "65vw",
        height: "100%",
        maxWidth: "1500px",
        [theme.breakpoints.down("md")]: {
            width: "80vw"
        },
        [theme.breakpoints.down("sm")]: {
            width: "95vw"
        },
        [theme.breakpoints.down("xs")]: {
            width: "100vw"
        },
        transition: "width 150ms cubic-bezier(0.33, 1, 0.68, 1)"
    }
}));


export function EntitySideDialogs<S extends EntitySchema>({ collections }: { collections: EntityCollection[] }) {

    const sideEntityController = useSideEntityController();
    const schemasRegistry = useSchemasRegistry();

    const classes = useStyles();

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
        <>
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

                            <div
                                className={panel === undefined || !panel.selectedSubcollection ? classes.root : classes.wide}>
                                {panel && buildEntityView(panel)}
                            </div>
                        </EntityDrawer>
                    );
                })
            }

        </>
    );
}

