import {
    Entity,
    EntityCollectionView,
    EntitySchema,
    FilterValues,
    ReferenceProperty
} from "../../models";
import { getIn } from "formik";
import {
    Box,
    Button,
    createStyles,
    Dialog,
    DialogActions,
    FormControl,
    FormHelperText,
    IconButton,
    makeStyles,
    Tooltip,
    Typography
} from "@material-ui/core";
import React, { useEffect } from "react";
import ErrorIcon from "@material-ui/icons/Error";
import ClearIcon from "@material-ui/icons/Clear";

import { CMSFieldProps } from "../form_props";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import { CollectionTable } from "../../collection/CollectionTable";
import { useSelectedEntityContext } from "../../SelectedEntityContext";
import { listenEntityFromRef } from "../../firebase";
import SkeletonComponent, { renderSkeletonCaptionText } from "../../preview/SkeletonComponent";
import KeyboardTabIcon from "@material-ui/icons/KeyboardTab";
import { PreviewComponent } from "../../preview";
import ErrorBoundary from "../../components/ErrorBoundary";
import { getCollectionViewFromPath } from "../../routes/navigation";
import { useAppConfigContext } from "../../AppConfigContext";
import { CMSAppProps } from "../../CMSAppProps";


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
    },
    dialogBody: {
        flexGrow: 1,
        overflow: "auto",
        minWidth: "85vw"
    }
}));

type ReferenceFieldProps<S extends EntitySchema> = CMSFieldProps<firebase.firestore.DocumentReference>;

export default function ReferenceField<S extends EntitySchema>({
                                                                   field,
                                                                   form: { isSubmitting, errors, touched, setFieldValue, setFieldTouched },
                                                                   property,
                                                                   includeDescription,
                                                                   entitySchema,
                                                                   partOfArray
                                                               }: ReferenceFieldProps<S>) {


    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    const value = field.value;

    const handleEntityClick = (entity: Entity<S>) => {
        const ref = entity ? entity.reference : null;
        setFieldTouched(field.name);
        setFieldValue(field.name, ref);
    };

    const classes = useStyles();

    const appConfig: CMSAppProps = useAppConfigContext();
    const collectionView: EntityCollectionView<any> = getCollectionViewFromPath(property.collectionPath, appConfig.navigation);

    const disabled = isSubmitting;
    return (
        <FormControl error={showError} fullWidth>

            <Box
                className={`${classes.root} ${disabled ? classes.disabled : ""}`}>

                {collectionView && <ReferenceDialog value={value}
                                                    property={property}
                                                    collectionPath={property.collectionPath}
                                                    collectionView={collectionView}
                                                    initialFilter={property.filter}
                                                    previewProperties={property.previewProperties}
                                                    onEntityClick={handleEntityClick}
                                                    partOfArray={partOfArray}
                                                    disabled={disabled}
                                                    entitySchema={entitySchema}/>}

                {!collectionView &&
                <Box>Reference field configured wrong. Check console</Box>}

            </Box>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && <FormHelperText
                id="component-error-text">{fieldError}</FormHelperText>}

        </FormControl>
    );
}


export interface ReferenceDialogProps<S extends EntitySchema<Key>, Key extends string = string> {

    value?: any;

    property: ReferenceProperty;

    /**
     * Absolute collection path
     */
    collectionPath: string,

    /**
     * In case this table should have some filters set
     */
    initialFilter?: FilterValues<S>;

    /**
     * Properties that are displayed when as a preview
     */
    previewProperties?: Key[];

    collectionView: EntityCollectionView<S>;

    onEntityClick(entity?: Entity<S>): void;

    entitySchema: EntitySchema;

    partOfArray: boolean,

    disabled: boolean
}


export function ReferenceDialog<S extends EntitySchema>(
    {
        onEntityClick,
        value,
        property,
        collectionView,
        initialFilter,
        previewProperties,
        collectionPath,
        entitySchema,
        partOfArray,
        disabled
    }: ReferenceDialogProps<S>) {

    const classes = useStyles();
    const schema = collectionView.schema;
    const textSearchDelegate = collectionView.textSearchDelegate;
    const filterableProperties = collectionView.filterableProperties;

    const [open, setOpen] = React.useState(false);
    const [entity, setEntity] = React.useState<Entity<S>>();
    const selectedEntityContext = useSelectedEntityContext();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleEntityClick = (collectionPath: string, entity: Entity<S>) => {
        setOpen(false);
        onEntityClick(entity);
    };

    const clearValue = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(false);
        onEntityClick(undefined);
    };

    const seeEntityDetails = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (entity)
            selectedEntityContext.open({
                entityId: entity.id,
                collectionPath
            });
    };

    const handleClose = () => {
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
        let listProperties = previewProperties?.filter(p => allProperties.includes(p));
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
                            <Box key={"ref_prev_" + key + index}
                                 mt={0.5}
                                 mb={0.5}>
                                <ErrorBoundary>{
                                    entity ?
                                        React.createElement(PreviewComponent, {
                                            name: key as string,
                                            value: entity.values[key as string],
                                            property: propertyKey,
                                            size: "tiny",
                                            entitySchema: entitySchema
                                        })
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

                        {!missingEntity && <Box key={"ref_prev_id"}
                                                alignSelf={"center"}
                                                m={1}>
                            <Tooltip title={value && value.path}>
                                <Typography variant={"caption"}>
                                    {entity ? entity.id : renderSkeletonCaptionText()}
                                </Typography>
                            </Tooltip>
                        </Box>}

                        {!missingEntity && entity && value && <Box>
                            <Tooltip title={`See details for ${entity.id}`}>
                                <IconButton
                                    disabled={disabled}
                                    onClick={disabled ? undefined : seeEntityDetails}>
                                    <KeyboardTabIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>}

                        {!partOfArray && value && <Box>
                            <Tooltip title="Clear">
                                <IconButton
                                    disabled={disabled}
                                    onClick={disabled ? undefined : clearValue}>
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
        <React.Fragment>

            {buildEntityView()}

            <Dialog
                onClose={handleClose}
                maxWidth={"xl"}
                scroll={"paper"}
                open={open}>
                <Box className={classes.dialogBody}>
                    <CollectionTable collectionPath={collectionPath}
                                     schema={schema}
                                     includeToolbar={true}
                                     onEntityClick={handleEntityClick}
                                     paginationEnabled={false}
                                     title={`Select ${schema.name}`}
                                     filterableProperties={filterableProperties}
                                     textSearchDelegate={textSearchDelegate}
                                     initialFilter={initialFilter}
                    />
                </Box>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

        </React.Fragment>
    );

}

