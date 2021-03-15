import { Entity, EntityCollection, EntitySchema } from "../models";
import React, { useEffect, useState } from "react";
import { listenEntityFromRef } from "../models";
import { Link as ReactLink } from "react-router-dom";

import EntityPreview from "../components/EntityPreview";
import {
    Box,
    Container,
    createStyles,
    IconButton,
    makeStyles,
    Tab,
    Tabs,
    Tooltip
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import { getCMSPathFrom, removeInitialSlash } from "../routes/navigation";
import { EntityCollectionTable } from "../collection/EntityCollectionTable";
import { useSideEntityController } from "../contexts";


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

export function EntityDetailView<S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>>({ entity, schema, collectionPath, subcollections }: {
    entity?: Entity<S, Key>,
    collectionPath: string;
    schema: S,
    subcollections?: EntityCollection[];
}) {

    const classes = useStyles();
    const sideEntityController = useSideEntityController();

    const [updatedEntity, setUpdatedEntity] = useState<Entity<S, Key> | undefined>(entity);
    const [tabsPosition, setTabsPosition] = React.useState(0);

    const ref = React.createRef<HTMLDivElement>();

    useEffect(() => {
        setTabsPosition(0);
        ref.current!.scrollTo({ top: 0 });
        const cancelSubscription =
            entity ?
                listenEntityFromRef<S, Key>(
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

    return <Container
        className={classes.root}
        disableGutters={true}
        fixed={true}>

        <Box
            className={classes.header}>

            <Tooltip title={"Close"}>
                <IconButton onClick={(e) => sideEntityController.close()}>
                    <CloseIcon/>
                </IconButton>
            </Tooltip>

            {entity &&
            <Tooltip title={"Full size"}>
                <IconButton
                    component={ReactLink}
                    to={getCMSPathFrom(entity.reference.path)}>
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
                    return <Box
                        key={`entity_detail_tab_content_${subcollection.name}`}
                        role="tabpanel"
                        flexGrow={1}
                        height={"100%"}
                        width={"100%"} hidden={tabsPosition !== colIndex + 1}>
                        <EntityCollectionTable
                            collectionPath={collectionPath}
                            collectionConfig={subcollection}
                        />
                    </Box>;
                }
            )}
        </div>
    </Container>;
}


