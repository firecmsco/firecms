import * as React from "react";
import { useEffect } from "react";
import clsx from "clsx";

import {
    createStyles,
    IconButton,
    makeStyles,
    Paper,
    Theme,
    Tooltip
} from "@material-ui/core";
import { Entity, EntitySchema } from "../models";

import { listenEntityFromRef } from "../firebase";
import { PreviewComponentProps, PreviewSize } from "./PreviewComponentProps";
import SkeletonComponent from "./SkeletonComponent";
import KeyboardTabIcon from "@material-ui/icons/KeyboardTab";
import { useSelectedEntityContext } from "../selected_entity_controller";
import Box from "@material-ui/core/Box/Box";
import ErrorIcon from "@material-ui/icons/Error";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            display: "flex",
            color: "#838383",
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            overflow: "hidden",
            fontWeight: 500
        },
        regular: {
            margin: theme.spacing(2),
            width: "100%"
        },
        small: {
            margin: theme.spacing(1),
            width: "100%"
        },
        tiny: {
            width: "100%",
            height: 36,
            itemsAlign: "center"
        },
        clamp: {
            lineClamp: 1
        }
    }));


export interface ReferencePreviewProps<S extends EntitySchema> {

    reference: firebase.firestore.DocumentReference;

    schema: S;

    /**
     * Limit the number of preview properties displayed base on the size of the
     * preview
     */
    size: PreviewSize;

    previewComponent: React.FunctionComponent<PreviewComponentProps>;

    /**
     * Properties that are displayed when as a preview
     */
    previewProperties?: (keyof S["properties"])[];

    entitySchema: EntitySchema;

}

export default function ReferencePreview<S extends EntitySchema>(
    {
        reference,
        schema,
        size,
        previewComponent,
        previewProperties,
        entitySchema
    }: ReferencePreviewProps<S>) {

    if (!reference)
        throw Error("Reference previews should be initialized with a value");

    const classes = useStyles();

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

    // non existing entity
    if (entity && !entity.values) {
        body = (
            <Tooltip title={reference.path}>
                <Box
                    display={"flex"}
                    alignItems={"center"}
                    m={1}>
                    <ErrorIcon fontSize={"small"} color={"error"}/>
                    <Box marginLeft={1}>Missing reference</Box>
                </Box>
            </Tooltip>
        );
    } else {
        body = (
            <React.Fragment>
                <Box display={"flex"}
                     flexDirection={"column"}
                     flexGrow={1}
                     maxWidth={"calc(100% - 60px)"}
                     m={1}>

                    {listProperties && listProperties.map((key) => {
                        const property = schema.properties[key as string];

                        return (
                            <Box key={"ref_prev" + property.title + key}
                                 m={size !== "tiny" ? 0.5 : 0}
                                 style={size !== "regular" ?
                                     {
                                         display: "block",
                                         whiteSpace: "nowrap",
                                         overflow: "hidden",
                                         textOverflow: "ellipsis"
                                     } : undefined}>
                                {entity ?
                                    React.createElement(previewComponent, {
                                        name: key as string,
                                        value: entity.values[key as string],
                                        property: property,
                                        size: "tiny",
                                        entitySchema: entitySchema
                                    })
                                    :
                                    <SkeletonComponent property={property}
                                                       size={"tiny"}/>
                                }
                            </Box>
                        );
                    })}

                </Box>
                <Box margin={"auto"}>
                    <Tooltip title="See details">
                        <IconButton
                            size={size === "tiny" ? "small" : "medium"}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (entity)
                                    selectedEntityContext.open({
                                        entity,
                                        schema
                                    });
                            }}>
                            <KeyboardTabIcon fontSize={"small"}/>
                        </IconButton>
                    </Tooltip>
                </Box>
            </React.Fragment>
        );
    }

    return (
        <Paper elevation={0} className={clsx(classes.paper,
            {
                [classes.regular]: size === "regular",
                [classes.small]: size === "small",
                [classes.tiny]: size === "tiny"
            })}>

            {body}

        </Paper>
    );

}
