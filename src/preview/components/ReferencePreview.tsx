import * as React from "react";
import clsx from "clsx";

import {
    IconButton,
    Paper,
    Skeleton,
    Theme,
    Tooltip,
    Typography
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { EntityReference, Property } from "../../models";

import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { PreviewComponentProps, PreviewSize } from "../preview_component_props";
import { useSideEntityController } from "../../contexts";

import SkeletonComponent from "./SkeletonComponent";
import PreviewComponent from "../PreviewComponent";
import ErrorView from "../../core/components/ErrorView";
import { useSchemasRegistry } from "../../contexts/SchemaRegistry";
import { useEntityFetch } from "../../hooks/data/useEntityFetch";

/**
 * @category Preview components
 */
export default function ReferencePreview(props: PreviewComponentProps<EntityReference>) {
    return <MemoReferencePreview {...props} />;
}

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

function ReferencePreviewComponent<M extends { [Key: string]: any }>(
    {
        value,
        property,
        onClick,
        size
    }: PreviewComponentProps<EntityReference>) {

    const referenceClasses = useReferenceStyles({ size });

    const reference: EntityReference = value;
    const previewProperties = property.previewProperties;

    const schemaRegistry = useSchemasRegistry();
    const collectionConfig = schemaRegistry.getCollectionConfig(property.path);
    if (!collectionConfig) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${property.path}`);
    }

    const schema = collectionConfig.schema;
    const sideEntityController = useSideEntityController();

    const {
        entity,
        dataLoading,
        dataLoadingError
    } = useEntityFetch({
        path: reference.path,
        entityId: reference.id,
        schema
    });

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
        return <ErrorView error={error} tooltip={tooltip}/>;
    }

    if (!value) {
        body = buildError("Reference not set");
    }
    // currently not happening since this gets filtered out in PreviewComponent
    else if (!(value instanceof EntityReference)) {
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
                            <div key={"ref_prev_" + (key as string)}
                                 className={referenceClasses.inner}>
                                {entity ?
                                    <PreviewComponent name={key as string}
                                                      value={entity.values[key as string]}
                                                      property={property as Property}
                                                      size={"tiny"}/>
                                    :
                                    <SkeletonComponent
                                        property={property as Property}
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
                                sideEntityController.open({
                                    entityId: entity.id,
                                    path: entity.path,
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

}

const MemoReferencePreview = React.memo<PreviewComponentProps<EntityReference>>(ReferencePreviewComponent) as React.FunctionComponent<PreviewComponentProps<EntityReference>>;

