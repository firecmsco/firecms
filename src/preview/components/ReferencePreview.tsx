import * as React from "react";
import { useEffect } from "react";
import clsx from "clsx";

import {
    createStyles,
    IconButton,
    makeStyles,
    Paper,
    Theme,
    Tooltip,
    Typography
} from "@material-ui/core";
import {
    Entity,
    EntityCollection,
    EntitySchema,
    listenEntityFromRef, Property,
    ReferenceProperty
} from "../../models";

import KeyboardTabIcon from "@material-ui/icons/KeyboardTab";
import {
    PreviewComponentProps,
    PreviewSize
} from "../../preview";
import { useSideEntityController } from "../../contexts";

import firebase from "firebase/app";
import "firebase/firestore";
import { SkeletonComponent } from "./SkeletonComponent";
import { PreviewComponent } from "../PreviewComponent";
import { PreviewError } from "./PreviewError";
import { Skeleton } from "@material-ui/lab";
import { useSchemasRegistry } from "../../side_dialog/SchemaRegistry";
import { useStyles } from "./styles";

const useReferenceStyles = makeStyles<Theme, { size: PreviewSize }>((theme: Theme) =>
    createStyles({
        paper: {
            display: "flex",
            color: "#838383",
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            borderRadius: "2px",
            overflow: "hidden",
            fontWeight: theme.typography.fontWeightMedium
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
            tabindex: 0,
            backgroundColor: "rgba(0, 0, 0, 0.09)",
            transition: "background-color 300ms ease, box-shadow 300ms ease",
            "&:hover": {
                cursor: "pointer",
                backgroundColor: "#e7e7e7",
                boxShadow: "0 0 0 2px rgba(0,0,0,0.1)"
            }
        }
    }));


export function ArrayOfReferencesPreview({
                                             name,
                                             value,
                                             property,
                                             size
                                         }: PreviewComponentProps<any[]>) {

    if (property.dataType !== "array" || property.of.dataType !== "reference")
        throw Error("Picked wrong preview component ArrayOfReferencesPreview");

    const classes = useStyles();
    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <>
            {value &&
            value.map((v, index) =>
                <div className={classes.arrayItem}
                     key={`preview_array_ref_${name}_${index}`}>
                    <ReferencePreview
                        name={`${name}[${index}]`}
                        size={childSize}
                        value={v}
                        property={property.of as ReferenceProperty}
                    />
                </div>
            )}
        </>
    );
}


export const ReferencePreview = React.memo<PreviewComponentProps<firebase.firestore.DocumentReference>>(
    function ReferencePreview<S extends EntitySchema>(
        {
            value,
            property,
            onClick,
            size
        }: PreviewComponentProps<firebase.firestore.DocumentReference>) {

        const referenceClasses = useReferenceStyles({ size });

        // TODO: remove when https://github.com/firebase/firebase-js-sdk/issues/4125 is fixed and replace with instance check of DocumentReference
        const isFirestoreReference = value
            && typeof value === "object"
            && "firestore" in value
            && typeof value["firestore"] === "object";
        // const isFirestoreReference = value instanceof models.firestore.DocumentReference;

        const reference: firebase.firestore.DocumentReference = value;
        const previewProperties = property.previewProperties;

        const schemaRegistry = useSchemasRegistry();
        const collectionConfig = schemaRegistry.getCollectionConfig(property.collectionPath);
        if(!collectionConfig) {
            throw Error(`Couldn't find the corresponding collection view for the path: ${property.collectionPath}`);
        }

        const schema = collectionConfig.schema;
        const [entity, setEntity] = React.useState<Entity<typeof schema>>();

        const selectedEntityController = useSideEntityController();

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

        function buildError(error: string, tooltip?: string) {
            return <PreviewError error={error} tooltip={tooltip}/>;
        }

        if (!value) {
            body = buildError("Reference not set");
        }
        // currently not happening since this gets filtered out in PreviewComponent
        else if (!(value instanceof firebase.firestore.DocumentReference)) {
            body = buildError("Unexpected value", JSON.stringify(value));
        } else if (entity && !entity.values) {
            body = buildError("Reference does not exist", reference.path);
        } else {

            body = (
                <>
                    <div className={referenceClasses.root}>

                        {size !== "tiny" && (
                            value ?
                                <div className={referenceClasses.inner}>
                                    <Typography variant={"caption"}
                                                className={"mono"}>
                                        {value.id}
                                    </Typography>
                                </div>
                                : <Skeleton variant="text"/>)}


                        {listProperties && listProperties.map((key) => {
                            const property = schema.properties[key as string];

                            return (
                                <div key={"ref_prev_" + key}
                                     className={referenceClasses.inner}>
                                    {entity ?
                                        <PreviewComponent name={key as string}
                                                          value={entity.values[key as string]}
                                                          property={property as Property}
                                                          size={"tiny"}/>
                                        :
                                        <SkeletonComponent property={property as Property}
                                                           size={"tiny"}/>
                                    }
                                </div>
                            );
                        })}

                    </div>
                    <div className={referenceClasses.marginAuto}>
                        {entity &&
                        <Tooltip title={`See details for ${entity.id}`}>
                            <IconButton
                                size={size === "tiny" ? "small" : "medium"}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    selectedEntityController.open({
                                        entityId: entity.id,
                                        collectionPath: reference.parent.path,
                                        schema,
                                        overrideSchemaResolver: false
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
            <Paper elevation={0} className={clsx(referenceClasses.paper,
                {
                    [referenceClasses.regular]: size === "regular",
                    [referenceClasses.small]: size === "small",
                    [referenceClasses.tiny]: size === "tiny",
                    [referenceClasses.clickable]: !!onClick
                })}
                   onClick={onClick}>

                {body}

            </Paper>
        );

    });

