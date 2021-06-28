import React from "react";
import { EntityCollection, EntitySchema } from "../../models";
import { createStyles, makeStyles } from "@material-ui/core";
import { useRouteMatch } from "react-router-dom";
import { useBreadcrumbsContext } from "../../contexts";
import { EntityCollectionTable } from "../components/EntityCollectionTable";

export const useStyles = makeStyles(() =>
    createStyles({
        root: {
            height: "100%",
            display: "flex",
            flexDirection: "column"
        }
    })
);

interface CollectionRouteProps<S extends EntitySchema<Key>, Key extends string> {
    collectionConfig: EntityCollection<S, Key>;
    collectionPath: string
}

function CollectionRoute<S extends EntitySchema<Key>, Key extends string>({
                                                                              collectionConfig,
                                                                              collectionPath
                                                                          }
                                                                              : CollectionRouteProps<S, Key>) {

    const { url } = useRouteMatch();
    const breadcrumbsContext = useBreadcrumbsContext();
    React.useEffect(() => {
        breadcrumbsContext.set({
            breadcrumbs: [{
                title: collectionConfig.name,
                url: url
            }]
        });
    }, [url]);

    const classes = useStyles();

    return (
        <div className={classes.root}>

            <EntityCollectionTable
                collectionPath={collectionPath}
                collectionConfig={collectionConfig}/>

        </div>
    );
}

export default CollectionRoute;
