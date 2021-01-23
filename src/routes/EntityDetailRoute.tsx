import React, { useEffect, useState } from "react";
import { Entity, EntityCollectionView, EntitySchema } from "../models";
import { listenEntity } from "../models/firestore";
import { useParams } from "react-router-dom";
import { EntityDetailView } from "../preview/EntityDetailView";

interface EntityDetailRoute<S extends EntitySchema> {
    view: EntityCollectionView<S>;
    collectionPath: string;
}

export function EntityDetailRoute<S extends EntitySchema>({
                                                              view,
                                                              collectionPath
                                                          }: EntityDetailRoute<S>) {

    const entityId: string = useParams()["entityId"];

    const [entity, setEntity] = useState<Entity<S>>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (entityId) {
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

    return loading ? <div/> : <EntityDetailView entity={entity}
                                                     schema={view.schema}
                                                     subcollections={view.subcollections}/>;
}
