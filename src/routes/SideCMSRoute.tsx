import React, { useState } from "react";
import { EntityCollectionView, EntitySchema } from "../models";
import { buildCollectionPath, removeInitialSlash } from "./navigation";
import {
    Route,
    Switch,
    useLocation,
    useParams,
    useRouteMatch
} from "react-router-dom";
import EntityFormRoute from "./EntityFormRoute";
import { useSelectedEntityContext } from "../SelectedEntityContext";
import { createStyles, Drawer, makeStyles } from "@material-ui/core";


export type CMSRouteType = "collection" | "entity";

interface SideCMSRouteProps<S extends EntitySchema> {
    view: EntityCollectionView<S>;
    collectionPath: string;
    type: CMSRouteType;
    onViewSelected: (selected: "form" | "collection") => void;
}

export function SideCMSRoute<S extends EntitySchema>({
                                                         view,
                                                         collectionPath,
                                                         type,
                                                         onViewSelected
                                                     }: SideCMSRouteProps<S>) {

    const entityId: string = useParams()["entityId"];

    const location = useLocation();
    const { path, url } = useRouteMatch();


    return (

        <React.Fragment>
            {type === "collection" && <Switch location={location}>

                <Route path={`${path}/new`}>
                    <SideCMSRoute
                        type={"entity"}
                        collectionPath={collectionPath}
                        view={view}
                        onViewSelected={onViewSelected}
                    />
                </Route>

                <Route path={`${path}/:entityId`}>
                    <SideCMSRoute
                        type={"entity"}
                        collectionPath={collectionPath}
                        view={view}
                        onViewSelected={onViewSelected}
                    />
                </Route>

            </Switch>}


            {type === "entity" && <Switch location={location}>
                {view.subcollections && view.subcollections.map(entityCollectionView => (
                        <Route
                            path={`${url}/${removeInitialSlash(entityCollectionView.relativePath)}`}
                            key={`navigation_sub_${entityCollectionView.relativePath}`}>
                            <SideCMSRoute
                                type={"collection"}
                                collectionPath={`${collectionPath}/${entityId}/${removeInitialSlash(entityCollectionView.relativePath)}`}
                                view={entityCollectionView}
                                onViewSelected={onViewSelected}
                            />
                        </Route>
                    )
                )}

                <Route path={path} exact={true}>
                    <EntityFormRoute
                        key={`side-form-route-${path}-${entityId}`}
                        collectionPath={collectionPath}
                        view={view}
                        context={"side"}
                        onViewSelected={onViewSelected}
                    />
                </Route>

            </Switch>}

        </React.Fragment>
    );
}

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

export default function EntityDetailDialog<S extends EntitySchema>({ navigation }: {
    navigation: EntityCollectionView[]
}) {

    const selectedEntityContext = useSelectedEntityContext();
    const isOpen = selectedEntityContext.isOpen;

    const [selectedView, setSelectedView] = useState<"form" | "collection">("form");

    const classes = useStyles();

    return (
        <Drawer
            key={"side_menu"}
            anchor={"right"}
            variant={"temporary"}
            open={isOpen}
            onClose={(_) => {
                setSelectedView("form");
                selectedEntityContext.close();
            }}
            ModalProps={{
                keepMounted: true
            }}
        >
            <div
                className={selectedView === "form" ? classes.root : classes.wide}>
                <Switch>
                    {navigation.map(entityCollectionView => (
                            <Route
                                path={buildCollectionPath(entityCollectionView.relativePath)}
                                key={`navigation_${entityCollectionView.relativePath}`}>
                                <SideCMSRoute
                                    type={"collection"}
                                    collectionPath={entityCollectionView.relativePath}
                                    view={entityCollectionView}
                                    onViewSelected={setSelectedView}
                                />
                            </Route>
                        )
                    )}
                </Switch>
            </div>
        </Drawer>

    );
}

