import React, { useState } from "react";
import { EntityCollection, EntitySchema } from "../models";
import { createStyles, makeStyles } from "@material-ui/core";
import { EntityDrawer } from "./EntityDrawer";
import EntityView from "./EntityView";
import { SidePanelProps, useSideEntityController } from "./SideEntityContext";

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


export function EntitySideDialogs<S extends EntitySchema>({ navigation }: { navigation: EntityCollection[] }) {

    const sideEntityContext = useSideEntityController();
    const classes = useStyles();

    const sidePanels = sideEntityContext.sidePanels;
    // const [sidePanelBeingClosed, setSidePanelBeingClosed] = useState<SidePanelProps | undefined>();

    const onExitAnimation = () => {
        // setSidePanelBeingClosed(undefined);
    };

    // const extraSidePanel = sidePanelBeingClosed;

    const allPanels = [...sidePanels, undefined];
    return (
        <>
            {/* we add an extra closed drawer, that it is used to maintain the transition when a drawer is removed */}
            {
                allPanels.map((panel: SidePanelProps | undefined, index) =>
                    (
                        <EntityDrawer
                            key={`side_menu_${index}`}
                            open={panel !== undefined}
                            onClose={() => {
                                // setSidePanelBeingClosed(panel);
                                sideEntityContext.close();
                            }}
                            offsetPosition={sidePanels.length - index - 1}
                            onExitAnimation={onExitAnimation}
                        >
                            <div
                                className={panel === undefined || !panel.selectedSubcollection ? classes.root : classes.wide}>

                                {panel && <EntityView
                                    key={`side-form-route-${panel.entityId}`}
                                    navigation={navigation}
                                    {...panel}/>
                                }
                            </div>
                        </EntityDrawer>
                    ))
            }

        </>
    );
}

