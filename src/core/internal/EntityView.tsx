import React, { useEffect, useState } from "react";
import EntityForm from "../../form/EntityForm";
import {
    Entity,
    EntityCollection,
    EntitySchema,
    EntityStatus,
    EntityValues,
    listenEntity,
    PermissionsBuilder,
    saveEntity
} from "../../models";
import {
    Box,
    CircularProgress,
    createStyles,
    IconButton,
    makeStyles,
    Paper,
    Tab,
    Tabs,
    Theme
} from "@material-ui/core";
import {
    useAuthContext,
    useCMSAppContext,
    useSideEntityController,
    useSnackbarController
} from "../../contexts";
import { Prompt } from "react-router-dom";
import CloseIcon from "@material-ui/icons/Close";
import { EntityCollectionTable } from "../components/EntityCollectionTable";
import { removeInitialSlash } from "../navigation";
import CircularProgressCenter from "./CircularProgressCenter";
import EntityPreview from "../components/EntityPreview";
import { canEdit } from "../../util/permissions";


const useStylesSide = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            height: "100%",
            display: "flex",
            flexDirection: "column"
        },
        container: {
            flexGrow: 1,
            height: "100%",
            overflow: "auto"
        },
        tabBar: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            paddingTop: theme.spacing(1),
            [theme.breakpoints.down("sm")]: {
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1),
                paddingTop: theme.spacing(0)
            }
        },
        form: {
            padding: theme.spacing(3),
            [theme.breakpoints.down("sm")]: {
                paddingLeft: theme.spacing(2),
                paddingRight: theme.spacing(2),
                paddingTop: theme.spacing(3),
                paddingBottom: theme.spacing(3)
            },
            [theme.breakpoints.down("xs")]: {
                paddingLeft: theme.spacing(0),
                paddingRight: theme.spacing(0),
                paddingTop: theme.spacing(2),
                paddingBottom: theme.spacing(1)
            }
        },
        header: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            paddingTop: theme.spacing(2),
            display: "flex",
            alignItems: "center",
            backgroundColor: theme.palette.background.default
        }

    })
);


export interface EntitySideViewProps {
    collectionPath: string;
    entityId?: string;
    copy?: boolean;
    selectedSubcollection?: string;
    permissions?: PermissionsBuilder<any, any>;
    schema: EntitySchema<any>;
    subcollections?: EntityCollection[];
}

function EntitySideView({
                            collectionPath,
                            entityId,
                            selectedSubcollection,
                            copy,
                            permissions,
                            schema,
                            subcollections
                        }: EntitySideViewProps) {

    const classes = useStylesSide();

    const sideEntityController = useSideEntityController();
    const snackbarContext = useSnackbarController();

    const context = useCMSAppContext();
    const authController = useAuthContext();

    const [entity, setEntity] = useState<Entity<EntitySchema>>();
    const [status, setStatus] = useState<EntityStatus>(copy ? "copy" : (entityId ? "existing" : "new"));
    const [loading, setLoading] = useState<boolean>(true);
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [tabsPosition, setTabsPosition] = React.useState(0);

    // have the original values of the form changed
    const [isModified, setModified] = useState(false);

    const onModified = (value: boolean) => {
        setModified(value);
    };


    useEffect(() => {
        if (entityId) {
            const cancelSubscription = listenEntity<EntitySchema>(
                collectionPath,
                entityId,
                schema,
                (e) => {
                    if (e) {
                        setStatus(copy ? "copy" : "existing");
                        setEntity(e);
                        console.debug("Updated entity from Firestore", e);
                    }
                    setLoading(false);
                });
            return () => cancelSubscription();
        } else {
            setStatus("new");
            setLoading(false);
        }
        return () => {
        };
    }, [collectionPath, entityId]);

    useEffect(() => {
        if (entity)
            setReadOnly(!canEdit(permissions, authController.loggedUser, entity));

    }, [entity]);

    useEffect(() => {
        if (!selectedSubcollection)
            setTabsPosition(0);
        if (subcollections && selectedSubcollection) {
            const index = subcollections
                .map((c) => c.relativePath)
                .findIndex((p) => p === selectedSubcollection);
            setTabsPosition(index + 1);
        }
    }, [selectedSubcollection]);


    async function onEntitySave(schema: EntitySchema, collectionPath: string, id: string | undefined, values: EntityValues<any, any>): Promise<void> {

        if (!status)
            return;

        const onPreSaveHookError = (e: Error) => {
            snackbarContext.open({
                type: "error",
                title: "Error before saving",
                message: e?.message
            });
            console.error(e);
        };

        const onSaveSuccessHookError = (e: Error) => {
            snackbarContext.open({
                type: "error",
                title: `${schema.name}: Error after saving (entity is saved)`,
                message: e?.message
            });
            console.error(e);
        };

        const onSaveSuccess = (updatedEntity: Entity<EntitySchema>) => {

            console.log("onSaveSuccess");
            setEntity(updatedEntity);

            snackbarContext.open({
                type: "success",
                message: `${schema.name}: Saved correctly`
            });

            setStatus("existing");
            setModified(false);
            sideEntityController.close();

        };

        const onSaveFailure = (e: Error) => {

            snackbarContext.open({
                type: "error",
                title: `${schema.name}: Error saving`,
                message: e?.message
            });

            console.error("Error saving entity", collectionPath, entityId, values);
            console.error(e);
        };

        if (status === "existing" && !isModified) {
            sideEntityController.close();
            return;
        }

        return saveEntity({
            collectionPath,
            id,
            values,
            schema,
            status,
            onSaveSuccess,
            onSaveFailure,
            onPreSaveHookError,
            onSaveSuccessHookError,
            context
        });
    }

    function onDiscard() {
        sideEntityController.close();
    }

    const existingEntity = status === "existing";

    const containerRef = React.useRef<HTMLDivElement>(null);

    const form = !readOnly ? (
        <EntityForm
            status={status}
            collectionPath={collectionPath}
            schema={schema}
            onEntitySave={onEntitySave}
            onDiscard={onDiscard}
            onModified={onModified}
            entity={entity}
            containerRef={containerRef}/>
    ) : (
        <EntityPreview
            entity={entity as any}
            schema={schema}/>
    );

    const subCollectionsView = subcollections && subcollections.map(
        (subcollectionView, colIndex) => {
            const collectionPath = entity ? `${entity?.reference.path}/${removeInitialSlash(subcollectionView.relativePath)}` : undefined;

            return (
                <Box
                    key={`subcol_${subcollectionView.name}_${colIndex}`}
                    role="tabpanel"
                    flexGrow={1}
                    height={"100%"}
                    width={"100%"}
                    hidden={tabsPosition !== colIndex + 1}>
                    {entity && collectionPath ?
                        <EntityCollectionTable collectionPath={collectionPath}
                                               collectionConfig={subcollectionView}
                        />
                        :
                        <Box m={3}
                             display={"flex"}
                             alignItems={"center"}
                             justifyContent={"center"}>
                            <Box>
                                You need to save your entity before
                                adding
                                additional collections
                            </Box>
                        </Box>
                    }
                </Box>
            );
        }
    );

    function onSideTabClick(value: number) {
        setTabsPosition(value);
        if (entityId && subcollections) {
            sideEntityController.open({
                collectionPath,
                entityId,
                selectedSubcollection: value !== 0
                    ? subcollections[value - 1].relativePath
                    : undefined,
                overrideSchemaResolver: false
            });
        }
    }


    return loading ?
        <CircularProgressCenter/>
        :
        <>

            <div className={classes.root}>

                <Paper elevation={0} variant={"outlined"}>
                    <div className={classes.header}>

                        <IconButton
                            onClick={(e) => sideEntityController.close()}>
                            <CloseIcon/>
                        </IconButton>

                        {loading && <CircularProgress size={16} thickness={8}/>}

                        <Box flexGrow={1}/>

                        <Tabs
                            value={tabsPosition}
                            indicatorColor="secondary"
                            textColor="inherit"
                            onChange={(ev, value) => {
                                onSideTabClick(value);
                            }}
                            className={classes.tabBar}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab
                                label={`${!readOnly ? (existingEntity ? "Edit" : `Add New`) : ""} ${schema.name}`
                                }/>

                            {subcollections && subcollections.map(
                                (subcollection) =>
                                    <Tab
                                        key={`entity_detail_tab_${subcollection.name}`}
                                        label={subcollection.name}/>
                            )}
                        </Tabs>
                    </div>

                </Paper>

                <div className={classes.container} ref={containerRef}>
                    <Box
                        role="tabpanel"
                        hidden={tabsPosition !== 0}
                        className={classes.form}>
                        {form}
                    </Box>

                    {subCollectionsView}

                </div>

            </div>

            <Prompt
                when={isModified && tabsPosition === 0}
                message={location =>
                    `You have unsaved changes in this ${schema.name}. Are you sure you want to leave this page?`
                }
            />
        </>;
}

export default React.memo(EntitySideView);
