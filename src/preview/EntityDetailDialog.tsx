import { Entity, EntityCollectionView, EntitySchema } from "../models";
import React, { useEffect, useState } from "react";
import { listenEntityFromRef } from "../firebase";

import EntityPreview from "../preview/EntityPreview";
import {
    Box,
    Container,
    createStyles,
    Drawer,
    IconButton,
    Link,
    makeStyles,
    Tab,
    Tabs
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import CollectionTable from "../collection/CollectionTable";
import EditIcon from "@material-ui/icons/Edit";
import { Link as ReactLink } from "react-router-dom";
import { useSelectedEntityContext } from "../selected_entity_controller";


export const useStyles = makeStyles(theme => createStyles({
    root: {
        height: "100%",
        maxWidth: "100vw",
        display: "flex",
        flexDirection: "column"
    },
    flexGrow: {
        flexGrow: 1,
        overflow: "auto"
    },
    header: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(2),
        display: "flex",
        alignItems: "center"
    }
}));

export default function EntityDetailDialog<S extends EntitySchema>() {

    const selectedEntityContext = useSelectedEntityContext();
    const {
        isOpen,
        tab,
        entity,
        schema,
        subcollections,
        close
    } = selectedEntityContext;

    const classes = useStyles();

    const [updatedEntity, setUpdatedEntity] = useState<Entity<S> | undefined>(entity);
    const [tabsPosition, setTabsPosition] = React.useState(tab);

    useEffect(() => {
        setTabsPosition(tab);
        const cancelSubscription =
            entity ?
                listenEntityFromRef<S>(
                    entity?.reference,
                    schema,
                    (e) => {
                        if (e) {
                            setUpdatedEntity(e);
                            console.log("Updated entity from Firestore", e);
                        }
                    })
                :
                () => {
                };
        return () => cancelSubscription();
    }, [entity]);

    function onSubcollectionEntityClick(collectionPath: string,
                                        clickedEntity: Entity<any>,
                                        clickedSchema: EntitySchema,
                                        subcollections?: EntityCollectionView<any>[]) {
        selectedEntityContext.open({
            entity: clickedEntity,
            schema: clickedSchema,
            subcollections
        });
    }

    return (
        <Drawer
            anchor={"right"}
            variant={"temporary"}
            open={isOpen}
            onClose={(e) => close()}
        >

            <Container

                className={classes.root}
                maxWidth={"md"}
                disableGutters={true}
                fixed={true}>

                <Box
                    className={classes.header}>

                    <IconButton>
                        <CloseIcon onClick={(e) => close()}/>
                    </IconButton>

                    {entity &&
                    <Link color="inherit"
                          component={ReactLink}
                          to={entity.reference.path}>
                        <IconButton>
                            <EditIcon onClick={(e) => close()}/>
                        </IconButton>
                    </Link>
                    }

                    <Box p={3}>
                        <Tabs
                            value={tabsPosition}
                            indicatorColor="primary"
                            textColor="primary"
                            onChange={(ev, value) => setTabsPosition(value)}
                            aria-label="disabled tabs example"
                        >
                            <Tab label={schema ? schema.name : ""}/>

                            {subcollections && subcollections.map(
                                (subcollection) =>
                                    <Tab label={subcollection.name}/>
                            )}
                        </Tabs>

                    </Box>
                </Box>
                <div className={classes.flexGrow}>
                    <Box
                        mb={4}
                        role="tabpanel"
                        hidden={tabsPosition !== 0}>
                        {updatedEntity && <EntityPreview
                            entity={updatedEntity}
                            schema={schema}/>
                        }
                    </Box>

                    {subcollections && subcollections.map(
                        (subcollection, colIndex) =>
                            <Box
                                role="tabpanel"
                                style={{ transition: "width 1s" }}
                                hidden={tabsPosition !== colIndex + 1}>
                                <CollectionTable
                                    collectionPath={`${entity?.reference.path}/${subcollection.relativePath}`}
                                    schema={subcollection.schema}
                                    additionalColumns={subcollection.additionalColumns}
                                    onEntityClick={(collectionPath: string, clickedEntity: Entity<any>) =>
                                        onSubcollectionEntityClick(collectionPath, clickedEntity, subcollection.schema, subcollection.subcollections)}
                                    includeToolbar={false}
                                    paginationEnabled={false}
                                    small={true}
                                />
                            </Box>
                    )}
                </div>
            </Container>
        </Drawer>

    );
}

