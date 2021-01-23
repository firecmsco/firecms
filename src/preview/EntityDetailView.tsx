import { Entity, EntityCollectionView, EntitySchema } from "../models";
import React, { useEffect, useState } from "react";
import { listenEntityFromRef } from "../models/firestore";
import { Link as ReactLink } from "react-router-dom";

import EntityPreview from "../preview/EntityPreview";
import {
    Box,
    Container,
    createStyles,
    IconButton,
    makeStyles,
    Tab,
    Tabs,
    Tooltip,
    Typography
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import { useSelectedEntityContext } from "../side_dialog/SelectedEntityContext";
import { CollectionTable } from "../collection/CollectionTable";
import { getEntityPathFrom, removeInitialSlash } from "../routes/navigation";
import { createFormField } from "../form/form_factory";


export const useStyles = makeStyles(theme => createStyles({
    root: {
        height: "100%",
        display: "flex",
        flexDirection: "column"
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

export function EntityDetailView<S extends EntitySchema>({ entity, schema, subcollections }: {
    entity?: Entity<S>,
    schema: S,
    subcollections?: EntityCollectionView[];
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
                                        subcollections?: EntityCollectionView[]) {
        selectedEntityContext.open({
            entityId: clickedEntity.id,
            collectionPath
        });
    }

    return <Container
        className={classes.root}
        disableGutters={true}
        fixed={true}>

        <Box
            className={classes.header}>

            <Tooltip title={"Close"}>
                <IconButton onClick={(e) => selectedEntityContext.close()}>
                    <CloseIcon/>
                </IconButton>
            </Tooltip>

            {entity &&
            <Tooltip title={"Full size"}>
                <IconButton
                    component={ReactLink}
                    to={getEntityPathFrom(entity.reference.path)}>
                    <EditIcon/>
                </IconButton>
            </Tooltip>
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
                            <Tab key={`entity_detail_tab_${subcollection.name}`}
                                 label={subcollection.name}/>
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

                    const deleteEnabled = subcollection.deleteEnabled === undefined || subcollection.deleteEnabled;
                    const editEnabled = subcollection.editEnabled === undefined || subcollection.editEnabled;
                    const inlineEditing = editEnabled && (subcollection.inlineEditing === undefined || subcollection.inlineEditing);

                    return <Box
                        key={`entity_detail_tab_content_${subcollection.name}`}
                        role="tabpanel"
                        flexGrow={1}
                        height={"100%"}
                        width={"100%"} hidden={tabsPosition !== colIndex + 1}>
                        <CollectionTable
                            collectionPath={collectionPath}
                            schema={subcollection.schema}
                            additionalColumns={subcollection.additionalColumns}
                            editEnabled={false}
                            inlineEditing={false}
                            deleteEnabled={false}
                            onEntityClick={(collectionPath: string, clickedEntity: Entity<any>) =>
                                onSubcollectionEntityClick(collectionPath, clickedEntity, subcollection.schema, subcollection.subcollections)}
                            includeToolbar={true}
                            paginationEnabled={false}
                            defaultSize={subcollection.defaultSize}
                            createFormField={createFormField}
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


