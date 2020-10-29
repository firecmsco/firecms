import { Entity, EntityCollectionView, EntitySchema } from "../models";
import React, { useEffect, useState } from "react";
import { listenEntityFromRef } from "../firebase";
import { Link as ReactLink, Route, Switch } from "react-router-dom";

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
import { useSelectedEntityContext } from "../selected_entity_controller";
import { CollectionTable } from "../collection/CollectionTable";
import {
    buildCollectionPath,
    getEntityEditPathFrom,
    removeInitialSlash
} from "../routes";
import { SideCMSRoute } from "../routes/CMSRoute";


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
    container: {
        flexGrow: 1,
        height: "100%",
        overflow: "auto",
        scrollBehavior: "smooth"
    },
    header: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(2),
        display: "flex",
        alignItems: "center"
    }
}));

export default function EntityDetailDialog<S extends EntitySchema>({ navigation }: { navigation: EntityCollectionView<any>[] }) {

    const selectedEntityContext = useSelectedEntityContext();
    const isOpen = selectedEntityContext.isOpen;

    return (
        <Drawer
            anchor={"right"}
            variant={"temporary"}
            open={isOpen}
            onClose={(_) => selectedEntityContext.close()}
        >
            <Switch>

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
            </Switch>
        </Drawer>

    );
}

export function EntityDetailView<S extends EntitySchema>({ entity, schema, subcollections }: {
    entity?: Entity<S>,
    schema: S,
    subcollections?: EntityCollectionView<any>[];
}) {

    const classes = useStyles();
    const selectedEntityContext = useSelectedEntityContext();

    const [updatedEntity, setUpdatedEntity] = useState<Entity<S> | undefined>(entity);
    const [tabsPosition, setTabsPosition] = React.useState(0);

    const ref = React.createRef<HTMLDivElement>();

    useEffect(() => {
        setTabsPosition(0);
        ref.current!.scrollTo({ top: 0 });
        const cancelSubscription =
            entity ?
                listenEntityFromRef<S>(
                    entity?.reference,
                    schema,
                    (e) => {
                        if (e) {
                            setUpdatedEntity(e);
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

    return <Container
        className={classes.root}
        disableGutters={true}
        fixed={true}>

        <Box
            className={classes.header}>

            <IconButton onClick={(e) => selectedEntityContext.close()}>
                <CloseIcon/>
            </IconButton>

            {entity &&
            <IconButton onClick={() => close()}
                        component={ReactLink}
                        to={getEntityEditPathFrom(entity.reference.path)}>
                <EditIcon/>
            </IconButton>
            }

            <Box paddingTop={2} paddingLeft={2} paddingRight={2}>
                <Tabs
                    value={tabsPosition}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(ev, value) => setTabsPosition(value)}
                >
                    <Tab label={schema ? schema.name : ""}/>

                    {subcollections && subcollections.map(
                        (subcollection) =>
                            <Tab label={subcollection.name}/>
                    )}
                </Tabs>

            </Box>
        </Box>

        <div className={classes.container}
             ref={ref}>
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
                        width={"100%"} hidden={tabsPosition !== colIndex + 1}>
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
                                </Typography>}
                        />
                    </Box>;
                }
            )}
        </div>
    </Container>;
}


