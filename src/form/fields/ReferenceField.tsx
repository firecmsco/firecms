import { Entity, EntitySchema, FilterValues } from "../../models";
import { getIn } from "formik";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    IconButton,
    Paper,
    Tooltip,
    Typography
} from "@material-ui/core";
import React from "react";
import { formStyles } from "../../styles";
import ReferencePreview from "../../preview/ReferencePreview";
import ClearIcon from "@material-ui/icons/Clear";
import CollectionTable from "../../collection/CollectionTable";
import { CMSFieldProps } from "../form_props";

import { PreviewComponent } from "../../preview";
import { FieldDescription } from "../../util";

type ReferenceFieldProps<S extends EntitySchema> = CMSFieldProps<firebase.firestore.DocumentReference> ;

export default function ReferenceField<S extends EntitySchema>({
                                                                   field,
                                                                   form: { isSubmitting, errors, touched, setFieldValue, setFieldTouched },
                                                                   property,
                                                                   includeDescription
                                                               }: ReferenceFieldProps<S>) {


    const fieldError = getIn(errors, field.name);
    const showError = getIn(touched, field.name) && !!fieldError;

    const value = field.value;

    const handleEntityClick = (entity: Entity<S>) => {
        const ref = entity ? entity.reference : null;
        setFieldTouched(field.name);
        setFieldValue(field.name, ref);
    };

    const classes = formStyles();
    const title = property.title || field.name;
    return (
        <FormControl error={showError} fullWidth>
            <Paper elevation={0} className={classes.paper}
                   variant={"outlined"}>
                <Box my={1}>
                    <Typography variant="caption"
                                display="block"
                                gutterBottom>
                        {title}
                    </Typography>
                </Box>
                <ReferenceDialog value={value}
                                 title={title}
                                 collectionPath={property.collectionPath}
                                 schema={property.schema}
                                 initialFilter={property.filter}
                                 previewProperties={property.previewProperties}
                                 onEntityClick={handleEntityClick}/>
            </Paper>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError && <FormHelperText
                id="component-error-text">{fieldError}</FormHelperText>}

        </FormControl>
    );
}


export interface ReferenceDialogProps<S extends EntitySchema> {

    value: any;

    title: string,

    /**
     * Absolute collection path
     */
    collectionPath: string,

    /**
     * In case this table should have some filters set
     */
    initialFilter?: FilterValues<S>;

    /**
     * Properties that need to be rendered when as a preview of this reference
     */
    previewProperties?: (keyof S["properties"])[];

    schema: S;

    onEntityClick(entity?: Entity<S>): void;
}

export function ReferenceDialog<S extends EntitySchema>(
    {
        onEntityClick,
        value,
        title,
        schema,
        initialFilter,
        previewProperties,
        collectionPath
    }: ReferenceDialogProps<S>) {

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleEntityClick = (collectionPath: string, entity: Entity<S>) => {
        setOpen(false);
        onEntityClick(entity);
    };

    const clearValue = () => {
        setOpen(false);
        onEntityClick(undefined);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <React.Fragment>
            <Grid
                justify="space-between"
                container
                spacing={2}>
                <Grid item xs={10}>
                    {value &&
                    <ReferencePreview
                        reference={value}
                        schema={schema}
                        previewProperties={previewProperties}
                        previewComponent={PreviewComponent}/>}
                    {!value &&
                    <Box>No value set</Box>}
                </Grid>
                <Grid item xs={2}>
                    {value &&
                    <Tooltip title="Clear">
                        <IconButton
                            style={{ backgroundColor: "white" }}
                            onClick={clearValue}>
                            <ClearIcon/>
                        </IconButton>
                    </Tooltip>}
                    <Button variant="outlined"
                            color="primary"
                            onClick={handleClickOpen}>
                        {value ? "Edit" : "Set"}
                    </Button>
                </Grid>
            </Grid>

            <Dialog
                onClose={handleClose}
                maxWidth={"xl"}
                open={open}>
                <DialogTitle>Select {title}</DialogTitle>
                <CollectionTable collectionPath={collectionPath}
                                 schema={schema}
                                 includeToolbar={false}
                                 onEntityClick={handleEntityClick}
                                 paginationEnabled={false}
                                 initialFilter={initialFilter}
                />
                <DialogActions>
                    <Button autoFocus onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

        </React.Fragment>
    );

}

