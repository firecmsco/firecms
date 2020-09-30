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
    Paper,
    Tooltip
} from "@material-ui/core";
import React from "react";
import ReferencePreview from "../../preview/ReferencePreview";
import ClearIcon from "@material-ui/icons/Clear";
import CollectionTable from "../../collection/CollectionTable";
import { CMSFieldProps } from "../form_props";

import { PreviewComponent } from "../../preview";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import { TextSearchDelegate } from "../../text_search_delegate";


export const useStyles = makeStyles(theme => createStyles({
    paper: {
        elevation: 0,
        padding: theme.spacing(1),
        [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
            padding: theme.spacing(2)
        }
    },
    dialogBody: {
        flexGrow: 1,
        overflow: "auto"
    }
}));

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

    const classes = useStyles();
    const title = property.title;

    return (
        <FormControl error={showError} fullWidth>

            <FormHelperText filled
                            required={property.validation?.required}>
                <LabelWithIcon scaledIcon={true} property={property}/>
            </FormHelperText>

            <Paper elevation={0}
                   className={`${classes.paper}`}
                   variant={"outlined"}>

                <ReferenceDialog value={value}
                                 title={title}
                                 collectionPath={property.collectionPath}
                                 schema={property.schema}
                                 initialFilter={property.filter}
                                 previewProperties={property.previewProperties}
                                 textSearchDelegate={property.textSearchDelegate}
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

    textSearchDelegate?: TextSearchDelegate;

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
        textSearchDelegate,
        collectionPath
    }: ReferenceDialogProps<S>) {

    const classes = useStyles();

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
            {value &&
            <Box p={1}
                 display="flex">
                <Box flexGrow={1}>
                    <ReferencePreview
                        reference={value}
                        schema={schema}
                        small={false}
                        previewProperties={previewProperties}
                        previewComponent={PreviewComponent}/>
                </Box>
                <Box>
                    <Tooltip title="Clear">
                        <IconButton
                            onClick={clearValue}>
                            <ClearIcon/>
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box p={1}>
                    <Button variant="outlined"
                            color="primary"
                            onClick={handleClickOpen}>
                        Edit
                    </Button>
                </Box>
            </Box>}

            {!value &&
            <Box p={2}
                 justifyContent="center"
                 display="flex">
                <Box flexGrow={1} textAlign={"center"}>No value set</Box>
                <Button variant="outlined"
                        color="primary"
                        onClick={handleClickOpen}>
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
                                     small={true}
                                     overrideTitle={`Select ${title}`}
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

