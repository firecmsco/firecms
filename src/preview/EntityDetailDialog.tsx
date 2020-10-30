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
    makeStyles,
    Tab,
    Tabs,
    Typography
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import { Link as ReactLink } from "react-router-dom";
import { useSelectedEntityContext } from "../selected_entity_controller";
import { CollectionTable } from "../collection/CollectionTable";
import { buildCollectionPath, removeInitialSlash } from "../routes";


export const useStyles = makeStyles(theme => createStyles({
    root: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "50vw",
        maxWidth: "900px",
        [theme.breakpoints.down("md")]: {
            width: "65vw"
        },
        [theme.breakpoints.down("sm")]: {
            width: "85vw"
        },
        [theme.breakpoints.down("xs")]: {
            width: "100vw"
        }
    },
    flexGrow: {
        flexGrow: 1,
        height: "100%",
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
                disableGutters={true}
                fixed={true}>

                <Box
                    className={classes.header}>

                    <IconButton onClick={(e) => close()}>
                        <CloseIcon/>
                    </IconButton>

                    {entity &&
                    <IconButton onClick={() => close()}
                                component={ReactLink}
                                to={buildCollectionPath(entity.reference.path)}>
                        <EditIcon/>
                    </IconButton>
                    }

                    <Box paddingTop={2} paddingLeft={2} paddingRight={2}>
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
                        (subcollection, colIndex) => {
                            const collectionPath = `${entity?.reference.path}/${removeInitialSlash(subcollection.relativePath)}`;
                            return <Box
                                role="tabpanel"
                                flexGrow={1}
                                height={"100%"}
                                width={"100%"}
                                hidden={tabsPosition !== colIndex + 1}>
                                <CollectionTable
                                    collectionPath={collectionPath}
                                    schema={subcollection.schema}
                                    additionalColumns={subcollection.additionalColumns}
                                    onEntityClick={(collectionPath: string, clickedEntity: Entity<any>) =>
                                        onSubcollectionEntityClick(collectionPath, clickedEntity, subcollection.schema, subcollection.subcollections)}
                                    includeToolbar={true}
                                    paginationEnabled={false}
                                    defaultSize={subcollection.defaultSize}
                                    title={
                                        <Typography variant={"caption"}
                                                    color={"textSecondary"}>
                                            {`/${collectionPath}`}
                                        </Typography>
                                    }
                                />
                            </Box>;
                        }
                    )}
                </div>
            </Container>
        </Drawer>

    );
}

