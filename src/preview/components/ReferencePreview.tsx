import * as React from "react";
import { useEffect } from "react";
import clsx from "clsx";

import {
    Box,
    createStyles,
    IconButton,
    makeStyles,
    Paper,
    Theme,
    Tooltip,
    Typography
} from "@material-ui/core";
import { Entity, EntityCollectionView, EntitySchema } from "../../models";

import { listenEntityFromRef } from "../../firebase";
import {
    PreviewComponentFactoryProps,
    PreviewComponentProps,
    PreviewSize
} from "../PreviewComponentProps";
import SkeletonComponent from "../SkeletonComponent";
import KeyboardTabIcon from "@material-ui/icons/KeyboardTab";
import { useSelectedEntityContext } from "../../side_dialog/SelectedEntityContext";
import ErrorIcon from "@material-ui/icons/Error";
import { getCollectionViewFromPath } from "../../routes/navigation";
import { CMSAppProps } from "../../CMSAppProps";
import { useAppConfigContext } from "../../contexts/AppConfigContext";

import firebase from "firebase/app";
import "firebase/firestore";
import { PreviewComponent } from "../PreviewComponent";

const useStyles = makeStyles<Theme, { size: PreviewSize }>((theme: Theme) =>
    createStyles({
        paper: {
            display: "flex",
            color: "#838383",
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            borderRadius: "2px",
            overflow: "hidden",
            fontWeight: 500
        },
        root: {
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            maxWidth: "calc(100% - 60px)",
            margin: theme.spacing(1)
        },
        regular: {
            padding: theme.spacing(1),
            width: "100%"
        },
        small: {
            width: "100%"
        },
        tiny: {
            width: "100%",
            height: 36,
            itemsAlign: "center"
        },
        clamp: {
            lineClamp: 1
        },
        marginAuto: {
            margin: "auto"
        },
        inner: {
            display: ({ size }) => size !== "regular" ? "block" : undefined,
            whiteSpace: ({ size }) => size !== "regular" ? "nowrap" : undefined,
            overflow: ({ size }) => size !== "regular" ? "hidden" : undefined,
            textOverflow: ({ size }) => size !== "regular" ? "ellipsis" : undefined,
            margin: ({ size }) => size !== "tiny" ? theme.spacing(0.2) : theme.spacing(0)
        },
        clickable: {
            "&:hover": {
                cursor: "pointer",
                backgroundColor: "#dedede"
            }
        }
    }));


export default React.memo<PreviewComponentProps<firebase.firestore.DocumentReference> & PreviewComponentFactoryProps>(
    function ReferencePreview<S extends EntitySchema>(
        {
            name,
            value,
            property,
            PreviewComponent,
            onClick,
            size,
            entitySchema
        }: PreviewComponentProps<firebase.firestore.DocumentReference> & PreviewComponentFactoryProps) {

        const classes = useStyles({ size });

        // TODO: remove when https://github.com/firebase/firebase-js-sdk/issues/4125 is fixed and replace with instance check of DocumentReference
        const isFirestoreReference = value
            && typeof value === "object"
            && "firestore" in value
            && typeof value["firestore"] === "object";
        // const isFirestoreReference = value instanceof firebase.firestore.DocumentReference;

        const reference: firebase.firestore.DocumentReference = value;
        const previewProperties = property.previewProperties;

        const appConfig: CMSAppProps = useAppConfigContext();
        const collectionView: EntityCollectionView<any> = getCollectionViewFromPath(property.collectionPath, appConfig.navigation);

        const schema = collectionView.schema;
        const [entity, setEntity] = React.useState<Entity<typeof schema>>();

        const selectedEntityContext = useSelectedEntityContext();

        useEffect(() => {
            const cancel = listenEntityFromRef(reference, schema, (e => {
                setEntity(e);
            }));
            return () => cancel();
        }, [reference, schema]);

        let listProperties = previewProperties;
        if (!listProperties || !listProperties.length) {
            listProperties = Object.keys(schema.properties);
        }

        if (size === "small" || size === "regular")
            listProperties = listProperties.slice(0, 3);
        else if (size === "tiny")
            listProperties = listProperties.slice(0, 1);

        let body: JSX.Element;

        function buildError(error: string) {
            return <Box
                display={"flex"}
                alignItems={"center"}
                m={1}>
                <ErrorIcon fontSize={"small"} color={"error"}/>
                <Box marginLeft={1}>{error}</Box>
            </Box>;
        }

        if (!value) {
            body = buildError("Reference not set");
        }
        // currently not happening since this gets filtered out in PreviewComponent
        else if (!(value instanceof firebase.firestore.DocumentReference)) {
            body = buildError("Unexpected value");
        } else if (entity && !entity.values) {
            body = (
                <Tooltip title={reference.path}>
                    {buildError("Reference does not exist")}
                </Tooltip>
            );
        } else {

            body = (
                <>
                    <div className={classes.root}>

                        {size !== "tiny" && entity &&
                        <div key={"ref_prev_id"}
                             className={classes.inner}>
                            <Typography variant={"caption"} className={"mono"}>
                                {entity.id}
                            </Typography>
                        </div>}

                        {listProperties && listProperties.map((key) => {
                            const property = schema.properties[key as string];

                            return (
                                <div key={"ref_prev" + property.title + key}
                                     className={classes.inner}>
                                    {entity && PreviewComponent ?
                                        <PreviewComponent name={key as string}
                                                          value={entity.values[key as string]}
                                                          property={property}
                                                          size={"tiny"}
                                                          entitySchema={entitySchema}/>
                                        :
                                        <SkeletonComponent property={property}
                                                           size={"tiny"}/>
                                    }
                                </div>
                            );
                        })}

                    </div>
                    <div className={classes.marginAuto}>
                        {entity &&
                        <Tooltip title={`See details for ${entity.id}`}>
                            <IconButton
                                size={size === "tiny" ? "small" : "medium"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    selectedEntityContext.open({
                                        entityId: entity.id,
                                        collectionPath: reference.parent.path
                                    });
                                }}>
                                <KeyboardTabIcon fontSize={"small"}/>
                            </IconButton>
                        </Tooltip>}
                    </div>
                </>
            );
        }

        return (
            <Paper elevation={0} className={clsx(classes.paper,
                {
                    [classes.regular]: size === "regular",
                    [classes.small]: size === "small",
                    [classes.tiny]: size === "tiny",
                    [classes.clickable]: !!onClick
                })}
                   onClick={onClick}>

                {body}

            </Paper>
        );

    });

