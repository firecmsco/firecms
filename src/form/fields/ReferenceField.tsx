import { Entity, EntitySchema, FilterValues } from "../../models";
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
    Tooltip
} from "@material-ui/core";
import React, { useEffect } from "react";
import ErrorIcon from "@material-ui/icons/Error";
import ClearIcon from "@material-ui/icons/Clear";

import { CMSFieldProps } from "../form_props";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import { TextSearchDelegate } from "../../text_search_delegate";
import { CollectionTable } from "../../collection/CollectionTable";
import { useSelectedEntityContext } from "../../selected_entity_controller";
import { listenEntityFromRef } from "../../firebase";
import SkeletonComponent from "../../preview/SkeletonComponent";
import KeyboardTabIcon from "@material-ui/icons/KeyboardTab";
import { PreviewComponent } from "../../preview";
import ErrorBoundary from "../../components/ErrorBoundary";


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
            backgroundColor: "#dedede"
        },
        color: "#838383",
        fontWeight: 500
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
                                                                   entitySchema
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
    const title = property.title;

    return (
        <FormControl error={showError} fullWidth>

            <FormHelperText filled
                            required={property.validation?.required}>
                <LabelWithIcon scaledIcon={true} property={property}/>
            </FormHelperText>

            <Box className={`${classes.root}`}>
                <ReferenceDialog value={value}
                                 title={title}
                                 collectionPath={property.collectionPath}
                                 schema={property.schema === "self" ? entitySchema : property.schema}
                                 initialFilter={property.filter}
                                 previewProperties={property.previewProperties}
                                 textSearchDelegate={property.textSearchDelegate}
                                 onEntityClick={handleEntityClick}
                                 entitySchema={entitySchema}/>

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

    title?: string,

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

    textSearchDelegate?: TextSearchDelegate;

    schema: S;

    onEntityClick(entity?: Entity<S>): void;

    entitySchema: EntitySchema;
}


export function ReferenceDialog<S extends EntitySchema>(
    {
        onEntityClick,
        value,
        title,
        schema,
        initialFilter,
        previewProperties,
        textSearchDelegate,
        collectionPath,
        entitySchema
    }: ReferenceDialogProps<S>) {

    const classes = useStyles();

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
                entity,
                schema
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
                <Tooltip title={value.path}>
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
            body = (
                <Box display={"flex"}
                     flexDirection={"column"}
                     flexGrow={1}
                     m={1}>
                    {listProperties && listProperties.map((key, index) => {
                        const property = schema.properties[key as string];
                        return (
                            <Box key={"ref_prev_" + key + index}
                                 m={1}>
                                <ErrorBoundary>{
                                    entity ?
                                        React.createElement(PreviewComponent, {
                                            name: key as string,
                                            value: entity.values[key as string],
                                            property: property,
                                            size: "tiny",
                                            entitySchema: entitySchema
                                        })
                                        :
                                        <SkeletonComponent
                                            property={property}
                                            size={"tiny"}/>}
                                </ErrorBoundary>
                            </Box>
                        );
                    })}
                </Box>
            );
        }

        return (
            <Box onClick={handleClickOpen}
                 display="flex">

                {body}

                {!missingEntity && <Box>
                    <Tooltip title="See details">
                        <IconButton
                            onClick={seeEntityDetails}>
                            <KeyboardTabIcon/>
                        </IconButton>
                    </Tooltip>
                </Box>}

                <Box>
                    <Tooltip title="Clear">
                        <IconButton
                            onClick={clearValue}>
                            <ClearIcon/>
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        );
    }

    return (
        <React.Fragment>

            {value && buildEntityView()}

            {!value &&
            <Box p={2}
                 onClick={handleClickOpen}
                 justifyContent="center"
                 display="flex">
                <Box flexGrow={1} textAlign={"center"}>No value set</Box>
                <Button variant="outlined"
                        color="primary">
                    Set
                </Button>
            </Box>}

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
                                     title={`Select ${title}`}
                                     textSearchDelegate={textSearchDelegate}
                                     initialFilter={initialFilter}
                    />
                </Box>
                <DialogActions>
                    <Button autoFocus onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

        </React.Fragment>
    );

}

