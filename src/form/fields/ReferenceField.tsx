import {
    Entity,
    EntityCollectionView,
    EntitySchema
} from "../../models";
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

import { CMSFieldProps } from "../../models/form_props";
import { FieldDescription } from "../../components";
import { getCollectionViewFromPath } from "../../routes/navigation";
import { useAppConfigContext } from "../../contexts/AppConfigContext";
import { CMSAppProps } from "../../CMSAppProps";
import { ReferenceDialog } from "../../references/ReferenceDialog";
import ErrorBoundary from "../../components/ErrorBoundary";
import { PreviewComponent, SkeletonComponent } from "../../preview";
import { LabelWithIcon } from "../../components/LabelWithIcon";

import ErrorIcon from "@material-ui/icons/Error";
import ClearIcon from "@material-ui/icons/Clear";
import { useSelectedEntityContext } from "../../side_dialog/SelectedEntityContext";
import { listenEntityFromRef } from "../../models/firestore";
import KeyboardTabIcon from "@material-ui/icons/KeyboardTab";
import { CollectionTable } from "../../collection/CollectionTable";

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
        fontWeight: 500
    },
    disabled: {
        backgroundColor: "rgba(0, 0, 0, 0.12)",
        color: "rgba(0, 0, 0, 0.38)",
        borderBottomStyle: "dotted"
    }
}));


export default function ReferenceField<S extends EntitySchema>({
                                                                   name,
                                                                   value,
                                                                   setValue,
                                                                   error,
                                                                   showError,
                                                                   isSubmitting,
                                                                   touched,
                                                                   autoFocus,
                                                                   property,
                                                                   includeDescription,
                                                                   entitySchema,
                                                                   partOfArray,
                                                                   createFormField
                                                               }: CMSFieldProps<firebase.firestore.DocumentReference>) {

    const handleEntityClick = (entity: Entity<S>) => {
        if (isSubmitting)
            return;
        const ref = entity ? entity.reference : null;
        setValue(ref);
        setOpen(false);
    };


    const classes = useStyles();

    const appConfig: CMSAppProps = useAppConfigContext();
    const collectionView: EntityCollectionView<any> = getCollectionViewFromPath(property.collectionPath, appConfig.navigation);

    const schema = collectionView.schema;
    const collectionPath = property.collectionPath;

    const [open, setOpen] = React.useState(autoFocus);
    const [entity, setEntity] = React.useState<Entity<S>>();
    const selectedEntityContext = useSelectedEntityContext();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const clearValue = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(false);
        setEntity(undefined);
    };

    const seeEntityDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (entity)
            selectedEntityContext.open({
                entityId: entity.id,
                collectionPath
            });
    };

    const onClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (value) {
            const cancel = listenEntityFromRef<S>(value, schema, (e => {
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
        } else if (value) {
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
                                 mt={0.5}
                                 mb={0.5}>
                                <ErrorBoundary>{
                                    entity ?
                                        <PreviewComponent
                                            name={key}
                                            value={entity.values[key as string]}
                                            property={propertyKey}
                                            size={"tiny"}
                                            entitySchema={entitySchema}/>
                                        :
                                        <SkeletonComponent
                                            property={propertyKey}
                                            size={"tiny"}/>}
                                </ErrorBoundary>
                            </Box>
                        );
                    })}
                </Box>
            );
        } else {
            body = <Box p={1}
                        onClick={isSubmitting ? undefined : handleClickOpen}
                        justifyContent="center"
                        display="flex">
                <Box flexGrow={1} textAlign={"center"}>No value set</Box>
                <Button variant="outlined"
                        color="primary">
                    Set
                </Button>
            </Box>;
        }

        return (
            <Box
                onClick={isSubmitting ? undefined : handleClickOpen}
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
                                <IconButton
                                    disabled={isSubmitting}
                                    onClick={isSubmitting ? undefined : seeEntityDetails}>
                                    <KeyboardTabIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>}

                        {!partOfArray && value && <Box>
                            <Tooltip title="Clear">
                                <IconButton
                                    disabled={isSubmitting}
                                    onClick={isSubmitting ? undefined : clearValue}>
                                    <ClearIcon/>
                                </IconButton>
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
                className={`${classes.root} ${isSubmitting ? classes.disabled : ""}`}>

                {buildEntityView()}

                {collectionView && <ReferenceDialog open={open}
                                                    collectionPath={collectionPath}
                                                    collectionView={collectionView}
                                                    onClose={onClose}
                                                    onEntityClick={handleEntityClick}
                                                    createFormField={createFormField}
                                                    CollectionTable={CollectionTable}
                />}

                {!collectionView &&
                <Box>Reference field configured wrong. Check console</Box>}

            </Box>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && <FormHelperText
                id="component-error-text">{error}</FormHelperText>}

        </FormControl>
    );
}


