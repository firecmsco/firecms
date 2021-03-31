import { Entity, EntitySchema, Property } from "../../models";
import firebase from "firebase/app";
import {
    Box,
    Button,
    createStyles,
    FormControl,
    FormHelperText,
    IconButton,
    makeStyles,
    Tooltip,
    Typography
} from "@material-ui/core";
import React, { useEffect } from "react";

import { FieldProps } from "../../models/fields";
import { FieldDescription } from "../../components";
import { ReferenceDialog } from "../components/ReferenceDialog";
import ErrorBoundary from "../../components/ErrorBoundary";
import { PreviewComponent, SkeletonComponent } from "../../preview";
import { LabelWithIcon } from "../components/LabelWithIcon";

import ErrorIcon from "@material-ui/icons/Error";
import ClearIcon from "@material-ui/icons/Clear";
import { listenEntityFromRef } from "../../models/firestore";
import KeyboardTabIcon from "@material-ui/icons/KeyboardTab";
import { CollectionTable } from "../../collection/CollectionTable";
import { useSideEntityController } from "../../contexts/SideEntityController";
import { useSchemasRegistry } from "../../side_dialog/SchemaRegistry";
import { useClearRestoreValue } from "../useClearRestoreValue";

export const useStyles = makeStyles(theme => createStyles({
    root: {
        elevation: 0,
        width: "100%",
        padding: theme.spacing(1),
        position: "relative",
        transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
        borderTopLeftRadius: "2px",
        borderTopRightRadius: "2px",
        backgroundColor: "rgba(0, 0, 0, 0.09)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
        "&:hover": {
            cursor: "pointer",
            backgroundColor: "#dedede"
        },
        color: "#838383",
        fontWeight: theme.typography.fontWeightMedium
    },
    disabled: {
        backgroundColor: "rgba(0, 0, 0, 0.12)",
        color: "rgba(0, 0, 0, 0.38)",
        borderBottomStyle: "dotted"
    }
}));


export default function ReferenceField<S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>>({
                                                                   name,
                                                                   value,
                                                                   setValue,
                                                                   error,
                                                                   showError,
                                                                   disabled,
                                                                   touched,
                                                                   autoFocus,
                                                                   property,
                                                                   includeDescription,
                                                                   context,
                                                                   CMSFormField,
                                                                   dependsOnOtherProperties
                                                               }: FieldProps<firebase.firestore.DocumentReference>) {

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const handleEntityClick = (entity: Entity<S, Key>) => {
        if (disabled)
            return;
        const ref = entity ? entity.reference : null;
        setValue(ref);
        setOpen(false);
    };

    const classes = useStyles();

    const schemaRegistry = useSchemasRegistry();
    const collectionConfig = schemaRegistry.getCollectionConfig(property.collectionPath);
    if(!collectionConfig) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${property.collectionPath}`);
    }

    const schema = collectionConfig.schema;
    const collectionPath = property.collectionPath;

    const [open, setOpen] = React.useState(autoFocus);
    const [entity, setEntity] = React.useState<Entity<S, Key>>();
    const sideEntityController = useSideEntityController();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const clearValue = (e: React.MouseEvent) => {
        e.stopPropagation();
        setValue(null);
        setOpen(false);
        setEntity(undefined);
    };

    const seeEntityDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (entity)
            sideEntityController.open({
                entityId: entity.id,
                collectionPath,
                overrideSchemaResolver: false
            });
    };

    const onClose = () => {
        setOpen(false);
    };

    const validValue = value && value instanceof firebase.firestore.DocumentReference;

    useEffect(() => {
        if (validValue) {
            const cancel = listenEntityFromRef(value, schema, (e => {
                setEntity(e);
            }));
            return () => cancel();
        } else {
            setEntity(undefined);
            return () => {
            };
        }
    }, [value, schema]);

    function buildEntityView() {

        const allProperties = Object.keys(schema.properties);
        let listProperties = property.previewProperties?.filter(p => allProperties.includes(p));
        if (!listProperties || !listProperties.length) {
            listProperties = allProperties;
        }
        listProperties = listProperties.slice(0, 3);

        const missingEntity = entity && !entity.values;

        let body: JSX.Element;
        if (missingEntity) {
            body = (
                <Tooltip title={value && value.path}>
                    <Box
                        display={"flex"}
                        alignItems={"center"}
                        p={1}
                        flexGrow={1}>
                        <ErrorIcon fontSize={"small"} color={"error"}/>
                        <Box marginLeft={1}>Missing
                            reference {entity && entity.id}</Box>
                    </Box>
                </Tooltip>
            );
        } else {
            if (validValue) {
                body = (
                    <Box display={"flex"}
                         flexDirection={"column"}
                         flexGrow={1}
                         ml={1}
                         mr={1}>

                        {listProperties && listProperties.map((key, index) => {
                            const propertyKey = schema.properties[key as string];
                            return (
                                <Box
                                    key={`reference_previews_${key}`}
                                    mt={0.5}
                                    mb={0.5}>
                                    <ErrorBoundary>{
                                        entity ?
                                            <PreviewComponent
                                                name={key}
                                                value={(entity.values as any)[key]}
                                                property={propertyKey as Property}
                                                size={"tiny"}/>
                                            :
                                            <SkeletonComponent
                                                property={propertyKey as Property}
                                                size={"tiny"}/>}
                                    </ErrorBoundary>
                                </Box>
                            );
                        })}
                    </Box>
                );
            } else {
                body = <Box p={1}
                            onClick={disabled ? undefined : handleClickOpen}
                            justifyContent="center"
                            display="flex">
                    <Box flexGrow={1} textAlign={"center"}>No value set</Box>
                    <Button variant="outlined"
                            color="primary">
                        Set
                    </Button>
                </Box>;
            }
        }

        return (
            <Box
                onClick={disabled ? undefined : handleClickOpen}
                display="flex">

                <Box display={"flex"}
                     flexDirection={"column"}
                     flexGrow={1}>

                    <Box display={"flex"}
                         flexDirection={"row"}
                         flexGrow={1}>

                        <Box flexGrow={1}>
                            <FormHelperText filled
                                            required={property.validation?.required}>
                                <LabelWithIcon scaledIcon={true}
                                               property={property}/>
                            </FormHelperText>
                        </Box>

                        {entity &&
                        <Box
                            alignSelf={"center"}
                            m={1}>
                            <Tooltip title={value && value.path}>
                                <Typography variant={"caption"}
                                            className={"mono"}>
                                    {entity.id}
                                </Typography>
                            </Tooltip>
                        </Box>}

                        {!missingEntity && entity && value && <Box>
                            <Tooltip title={`See details for ${entity.id}`}>
                                <span>
                                <IconButton
                                    disabled={disabled}
                                    onClick={disabled ? undefined : seeEntityDetails}>
                                    <KeyboardTabIcon/>
                                </IconButton>
                                    </span>
                            </Tooltip>
                        </Box>}

                        {value && <Box>
                            <Tooltip title="Clear">
                                <span>
                                <IconButton
                                    disabled={disabled}
                                    onClick={disabled ? undefined : clearValue}>
                                    <ClearIcon/>
                                </IconButton>
                                </span>
                            </Tooltip>
                        </Box>}

                    </Box>

                    {body}

                </Box>
            </Box>
        );
    }

    return (
        <FormControl error={showError} fullWidth>

            <Box
                className={`${classes.root} ${disabled ? classes.disabled : ""}`}>

                {buildEntityView()}

                {collectionConfig && <ReferenceDialog open={open}
                                                      multiselect={false}
                                                      collectionPath={collectionPath}
                                                      onClose={onClose}
                                                      onSingleEntitySelected={handleEntityClick}
                                                      CMSFormField={CMSFormField}
                                                      CollectionTable={CollectionTable}
                />}

                {!collectionConfig &&
                <Box>Reference field configured wrong. Check console</Box>}

            </Box>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && <FormHelperText
                id="component-error-text">{error}</FormHelperText>}

        </FormControl>
    );
}


