import { Entity, EntityCollection, EntitySchema } from "../../models";
import React, { useEffect, useState } from "react";

import { EntityPreview } from "./EntityPreview";
import { Box, Container, Tab, Tabs, Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { removeInitialAndTrailingSlashes } from "../util/navigation_utils";
import { EntityCollectionView } from "./EntityCollectionView";
import { useDataSource, useNavigation } from "../../hooks";


export const useStyles = makeStyles((theme: Theme) => createStyles({
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

/**
 * Show a view with details of an Entity properties
 * @param entity
 * @param schema
 * @param path
 * @param subcollections
 * @constructor
 */
export function EntityDetailView<M extends { [Key: string]: any }>({
                                                                       entity,
                                                                       schema,
                                                                       path,
                                                                       subcollections
                                                                   }: {
    entity?: Entity<M>,
    path: string;
    schema: EntitySchema<M>,
    subcollections?: EntityCollection<any>[];
}) {

    const dataSource = useDataSource();
    const classes = useStyles();

    const navigationContext = useNavigation();

    const [updatedEntity, setUpdatedEntity] = useState<Entity<M> | undefined>(entity);
    const [tabsPosition, setTabsPosition] = React.useState(0);

    const ref = React.createRef<HTMLDivElement>();

    useEffect(() => {
        setTabsPosition(0);
        ref.current!.scrollTo({ top: 0 });
        const cancelSubscription =
            entity && dataSource.listenEntity ?
                dataSource.listenEntity<M>({
                    path: entity?.path,
                    entityId: entity?.id,
                    schema,
                    onUpdate: (e) => {
                        if (e) {
                            setUpdatedEntity(e);
                        }
                    }
                })
                :
                () => {
                };
        return () => cancelSubscription();
    }, [entity]);

    return (
        <Container
            className={classes.root}
            disableGutters={true}
            fixed={true}>

            <div
                className={classes.header}>

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
                                <Tab
                                    key={`entity_detail_tab_${subcollection.name}`}
                                    label={subcollection.name}/>
                        )}
                    </Tabs>

                </Box>
            </div>

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
                        const path = `${entity?.path}/${entity?.id}/${removeInitialAndTrailingSlashes(subcollection.path)}`;
                        return <Box
                            key={`entity_detail_tab_content_${subcollection.name}`}
                            role="tabpanel"
                            flexGrow={1}
                            height={"100%"}
                            width={"100%"}
                            hidden={tabsPosition !== colIndex + 1}>
                            <EntityCollectionView
                                path={path}
                                collection={subcollection}
                            />
                        </Box>;
                    }
                )}
            </div>
        </Container>
    );
}


