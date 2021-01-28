import React, { useState } from "react";
import { Entity, EntityCollectionView, EntitySchema } from "../models";
import { BreadcrumbEntry } from "./navigation";
import { createStyles, makeStyles, Typography } from "@material-ui/core";
import { useRouteMatch } from "react-router-dom";
import { useBreadcrumbsContext } from "../contexts";
import { CollectionTable } from "../collection/CollectionTable";
import { useSelectedEntityContext } from "../side_dialog/SelectedEntityContext";
import { createFormField } from "../form/form_factory";
import { EntityCollectionTable } from "../collection/EntityCollectionTable";

export const useStyles = makeStyles(() =>
    createStyles({
        root: {
            height: "100%",
            display: "flex",
            flexDirection: "column"
        }
    })
);

interface CollectionRouteProps<S extends EntitySchema> {
    view: EntityCollectionView<S>;
    collectionPath: string;
    breadcrumbs: BreadcrumbEntry[];
}

export function CollectionRoute<S extends EntitySchema>({
                                                            view,
                                                            collectionPath,
                                                            breadcrumbs
                                                        }
                                                            : CollectionRouteProps<S>) {

    const { url } = useRouteMatch();
    const breadcrumbsContext = useBreadcrumbsContext();
    React.useEffect(() => {
        breadcrumbsContext.set({
            breadcrumbs: breadcrumbs
        });
    }, [url]);

    const classes = useStyles();

    return (
        <div className={classes.root}>

            <EntityCollectionTable collectionPath={collectionPath}
                             view={view}/>

        </div>
    );
}
