import React from "react";
import { EntityCollectionView, EntitySchema } from "../models";
import { Route, Switch } from "react-router-dom";
import { useSelectedEntityContext } from "./SelectedEntityContext";
import { createStyles, makeStyles } from "@material-ui/core";
import { SideCMSRoute } from "./SideCMSRoute";
import { EntityDrawer } from "./EntityDrawer";
import { buildCollectionPath } from "../routes/navigation";

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
        transition: "width 150ms cubic-bezier(0.33, 1, 0.68, 1)"
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

interface SidePanel {
    open: boolean;
    location?: any
}

export function EntitySideDialogs<S extends EntitySchema>({ navigation }: {
    navigation: EntityCollectionView[]
}) {

    const selectedEntityContext = useSelectedEntityContext();
    const classes = useStyles();

    const sidePanels: SidePanel[] = [
        ...selectedEntityContext.sideLocations.map((location) => ({
            open: true,
            location
        })),
        { open: false }]; // we add an extra closed drawer, that it is used to maintain the transition when a drawer is removed

    return <React.Fragment>
        {
            sidePanels.map((panel, index) => {
                const selectedView: "form" | "collection" = panel.location?.subcollection ? "collection" : "form";
                return (
                    <EntityDrawer
                        key={`side_menu_${index}`}
                        open={panel.open}
                        onClose={() => {
                            selectedEntityContext.close();
                        }}
                        offsetPosition={sidePanels.length - index - 2}
                    >
                        <div
                            className={selectedView === "form" ? classes.root : classes.wide}>
                            {panel.location &&
                            <Switch location={panel.location as any}>
                                {navigation.map(entityCollectionView => (
                                        <Route
                                            path={buildCollectionPath(entityCollectionView.relativePath)}
                                            key={`navigation_${entityCollectionView.relativePath}`}>
                                            <SideCMSRoute
                                                type={"collection"}
                                                collectionPath={entityCollectionView.relativePath}
                                                view={entityCollectionView}
                                            />
                                        </Route>
                                    )
                                )}
                            </Switch>}
                        </div>
                    </EntityDrawer>
                );
            })
        }
    </React.Fragment>;
}

