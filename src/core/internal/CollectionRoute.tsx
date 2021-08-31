import React from "react";
import { EntityCollection } from "../../models";
import createStyles from "@material-ui/styles/createStyles";
import makeStyles from "@material-ui/styles/makeStyles";
import { useLocation } from "react-router-dom";
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

interface CollectionRouteProps<M extends { [Key: string]: any }> {
    collectionConfig: EntityCollection<M>;
    path: string
}

function CollectionRoute<M extends { [Key: string]: any }>({
                                                                              collectionConfig,
                                                                              path
                                                                          }
                                                                              : CollectionRouteProps<M>) {

    const { pathname } = useLocation();
    const breadcrumbsContext = useBreadcrumbsContext();
    React.useEffect(() => {
        breadcrumbsContext.set({
            breadcrumbs: [{
                title: collectionConfig.name,
                url: pathname
            }]
        });
    }, [pathname]);

    const classes = useStyles();

    return (
        <div className={classes.root}>

            <EntityCollectionTable
                path={path}
                collectionConfig={collectionConfig}/>

        </div>
    );
}

export default CollectionRoute;
