import React from "react";
import { EntityCollection, EntitySchema } from "../models";
import {
    Route,
    Switch,
    useLocation,
    useParams,
    useRouteMatch
} from "react-router-dom";
import { EntityFormRoute } from "../routes";
import { removeInitialSlash } from "../routes/navigation";


export type CMSRouteType = "collection" | "entity";

interface SideCMSRouteProps<S extends EntitySchema> {
    view: EntityCollection<S>;
    collectionPath: string;
    type: CMSRouteType;
}

export function SideCMSRoute<S extends EntitySchema>({
                                                         view,
                                                         collectionPath,
                                                         type
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
                    />
                </Route>

                <Route path={`${path}/:entityId`}>
                    <SideCMSRoute
                        type={"entity"}
                        collectionPath={collectionPath}
                        view={view}
                    />
                </Route>

            </Switch>}


            {type === "entity" && <Switch location={location}>
                {/* Entity view with selected subcollection*/}
                {view.subcollections && view.subcollections.map(entityCollection => (
                        <Route exact
                               path={`${url}/${removeInitialSlash(entityCollection.relativePath)}`}
                               key={`navigation_sub_${entityCollection.relativePath}`}>
                            <EntityFormRoute
                                key={`side-form-route-${path}-${entityId}`}
                                collectionPath={collectionPath}
                                view={view}
                                context={"side"}
                            />
                        </Route>
                    )
                )}

                {/* Subcollection path */}
                {view.subcollections && view.subcollections.map(entityCollection => (
                        <Route
                            path={`${url}/${removeInitialSlash(entityCollection.relativePath)}`}
                            key={`navigation_sub_${entityCollection.relativePath}`}>
                            <SideCMSRoute
                                type={"collection"}
                                collectionPath={`${collectionPath}/${entityId}/${removeInitialSlash(entityCollection.relativePath)}`}
                                view={entityCollection}
                            />
                        </Route>
                    )
                )}

                {/* Entity path */}
                <Route path={path} exact={true}>
                    <EntityFormRoute
                        key={`side-form-route-${path}-${entityId}`}
                        collectionPath={collectionPath}
                        view={view}
                        context={"side"}
                    />
                </Route>

            </Switch>}

        </React.Fragment>
    );
}
