import React, { useEffect, useState } from "react";
import { Entity, EntityCollectionView, EntitySchema } from "../models";
import { listenEntity } from "../firebase";
import { BreadcrumbEntry } from "./navigation";
import { useBreadcrumbsContext } from "../breadcrumbs_controller";
import { useParams, useRouteMatch } from "react-router-dom";
import { EntityDetailView } from "../preview/EntityDetailDialog";
import Box from "@material-ui/core/Box";

interface EntityDetailRoute<S extends EntitySchema> {
    view: EntityCollectionView<S>;
    collectionPath: string;
}

export function EntityDetailRoute<S extends EntitySchema>({
                                                              view,
                                                              collectionPath,
                                                          }: EntityDetailRoute<S>) {

    const entityId: string = useParams()["entityId"];


    const [entity, setEntity] = useState<Entity<S>>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (entityId) {
            console.log("Listening entity", entityId);
            const cancelSubscription = listenEntity<S>(
                collectionPath,
                entityId,
                view.schema,
                (e) => {
                    if (e) {
                        setEntity(e);
                    }
                    setLoading(false);
                });
            return () => cancelSubscription();
        } else {
            setLoading(false);
        }
        return () => {
        };
    }, [entityId, view]);

    return loading ? <Box></Box> : <EntityDetailView entity={entity}
                                                     schema={view.schema}/>;
}
