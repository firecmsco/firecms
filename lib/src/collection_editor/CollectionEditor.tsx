import {
    Autocomplete,
    Box,
    Button,
    Container,
    FormControl,
    FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

import * as Yup from "yup";
import { Formik, FormikHelpers, getIn } from "formik";
import { useEffect, useMemo, useState } from "react";
import { Link as ReactLink, useLocation } from "react-router-dom";
import {
    useConfigurationPersistence
} from "../hooks/useConfigurationPersistence";
import { EntityCollection } from "../models";
import { CircularProgressCenter, ErrorView } from "../core";
import { useNavigation, useSnackbarController } from "../hooks";
import { SchemaEditorDialog } from "../schema_editor/SchemaEditorDialog";
import {
    computeTopNavigation,
    TopNavigationResult
} from "../core/util/navigation_utils";
import { useSchemaRegistry } from "../hooks/useSchemaRegistry";
import { LoadingButton } from "@mui/lab";
import { NewSchemaEditorDialog } from "../schema_editor/NewSchemaEditorDialog";
import { toSnakeCase } from "../core/util/strings";
import { CustomDialogActions } from "../core/components/CustomDialogActions";

/**
 * @category Components
 */
export interface CollectionEditorProps<M> {

    /**
     * Absolute path this collection view points to
     */
    path?: string;

    onSave?: (collection: EntityCollection<M>) => void;

    onCancel?: () => void;

    includeCollectionLink?: boolean;

}

const CollectionSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    path: Yup.string().required("Required"),
    schemaId: Yup.string().required("Required")
});

export function CollectionEditor<M>({
                                        path: pathProp,
                                        onSave,
                                        onCancel,
                                        includeCollectionLink = true
                                    }: CollectionEditorProps<M>) {

    const location = useLocation();
    const group = (location.state as any)?.group;
    const navigationContext = useNavigation();
    const schemaRegistry = useSchemaRegistry();
    const snackbarController = useSnackbarController();

    const schemas = schemaRegistry.schemas;

    const exitingCollection = Boolean(pathProp);

    const [path, setPath] = useState(pathProp);
    const [schemaDialogOpen, setSchemaDialogOpen] = useState<boolean>(false);
    const [newSchemaDialogOpen, setNewSchemaDialogOpen] = useState<boolean>(false);
    const [selectedSchemaId, setSelectedSchemaId] = useState<string | undefined>();

    const configurationPersistence = useConfigurationPersistence();
    if (!configurationPersistence)
        throw Error("Can't edit a collection with no `ConfigurationPersistence` specified");

    const {
        navigationEntries,
        groups
    }: TopNavigationResult = useMemo(() => computeTopNavigation(navigationContext, true), [navigationContext]);

    const [collection, setCollection] = useState<EntityCollection | undefined>();
    const [error, setError] = useState<Error | undefined>();

    useEffect(() => {
        if (path) {
            setError(undefined);
            configurationPersistence.getCollection(path)
                .then(setCollection)
                .catch((e) => {
                    console.error(`Error fetching persisted configuration for '${path}'`, e);
                    setError(e);
                });
        }
    }, [path]);

    if (error) {
        return <ErrorView
            error={<>Error fetching persisted configuration
                for <b>{path}</b></>}/>;
    }

    if (path && !collection)
        return <CircularProgressCenter/>;

    const isNewCollection = !collection;

    const initialValues = collection ?? {
        name: "",
        path: path ?? "",
        schemaId: "",
        group
    };

    const onSubmit = (values: EntityCollection, formikHelpers: FormikHelpers<EntityCollection>) => {
        console.log("onSubmit", values);
        return configurationPersistence
            .saveCollection(values.path, values)
            .then(() => {
                setPath(values.path);
                formikHelpers.resetForm({ values });
                if (onSave) {
                    onSave(values);
                }
                return snackbarController.open({
                    type: "success",
                    message: "Collection updated"
                });
            })
            .catch((e) => {
                console.error(e);
                snackbarController.open({
                    type: "error",
                    message: "Error saving collection"
                })
            });
    };

    return (
        <>
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                validationSchema={CollectionSchema}
                validate={(values) => console.debug("Validating", values)}
            >
                {({
                      values,
                      touched,
                      errors,
                      setFieldValue,
                      handleChange,
                      handleSubmit,
                      isSubmitting,
                      dirty
                  }) => {

                    const selectedSchema = values.schemaId ? schemaRegistry.findSchema(values.schemaId) : undefined;

                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    useEffect(() => {
                        const pathTouched = getIn(touched, "path");
                        if (!pathTouched && !exitingCollection && values.name) {
                            setFieldValue("path", toSnakeCase(values.name))
                        }

                    }, [exitingCollection, touched, values.name]);

                    return (
                        <>
                            <form onSubmit={handleSubmit}
                                  noValidate>

                                <Container maxWidth={"md"}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            pt: 3,
                                            pb: 2
                                        }}>
                                        <Typography variant={"h4"}>
                                            {isNewCollection ? "New collection" : `${values.name} collection`}
                                        </Typography>
                                        {includeCollectionLink && <Box>
                                            {path && <Button
                                                component={ReactLink}
                                                to={navigationContext.buildUrlCollectionPath(path)}
                                                sx={{
                                                    mx: 1
                                                }}>
                                                Go to collection
                                            </Button>}
                                        </Box>}
                                    </Box>

                                    <Paper elevation={0} sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        my: 1,
                                        p: 3
                                    }}>
                                        <Grid container spacing={2}>

                                            <Grid item xs={12}>
                                                <FormControl fullWidth
                                                             required
                                                             disabled={isSubmitting}
                                                             error={touched.name && Boolean(errors.name)}>
                                                    <InputLabel
                                                        htmlFor="name">Name</InputLabel>
                                                    <OutlinedInput
                                                        id="name"
                                                        value={values.name}
                                                        onChange={handleChange}
                                                        aria-describedby="name-helper-text"
                                                        label="Name"
                                                    />
                                                    <FormHelperText
                                                        id="name-helper-text">
                                                        {touched.name && Boolean(errors.name) ? errors.name : "Plural name of the collection (e.g. Products)"}
                                                    </FormHelperText>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12} sm={8}>
                                                <FormControl fullWidth
                                                             required
                                                             disabled={isSubmitting}
                                                             error={touched.path && Boolean(errors.path)}>
                                                    <InputLabel
                                                        htmlFor="path">{"Path"}</InputLabel>
                                                    <OutlinedInput
                                                        id={"path"}
                                                        aria-describedby={`${"path"}-helper`}
                                                        onChange={handleChange}
                                                        value={values.path}
                                                        label={"Path"}
                                                        disabled={!isNewCollection}/>
                                                    <FormHelperText
                                                        id="path-helper">
                                                        {touched.path && Boolean(errors.path) ? errors.path : "Path that this collection is stored in"}
                                                    </FormHelperText>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12} sm={4}>
                                                <FormControl fullWidth
                                                             error={touched.group && Boolean(errors.group)}
                                                >
                                                    <Autocomplete
                                                        id={"group"}
                                                        value={values.group}
                                                        fullWidth
                                                        freeSolo
                                                        options={groups}
                                                        onChange={(event, group) => {
                                                            setFieldValue("group", group);
                                                        }}
                                                        getOptionLabel={(option) => option}
                                                        renderOption={(props, group, { selected }) => (
                                                            <li {...props}>
                                                                {group}
                                                            </li>
                                                        )}
                                                        renderInput={(params) => (
                                                            <TextField {...params}
                                                                       disabled={isSubmitting}
                                                                       name={"group"}
                                                                       aria-describedby={"group-helper"}
                                                                       variant={"outlined"}
                                                                       label="Group"/>
                                                        )}
                                                    />
                                                    <FormHelperText
                                                        id="group-helper">
                                                        {touched.group && Boolean(errors.group) ? errors.group : "Group of the collection"}
                                                    </FormHelperText>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <FormControl fullWidth
                                                             disabled={isSubmitting}
                                                             error={touched.description && Boolean(errors.description)}>
                                                    <InputLabel
                                                        htmlFor="description">Description</InputLabel>
                                                    <OutlinedInput
                                                        id="description"
                                                        value={values.description}
                                                        onChange={handleChange}
                                                        aria-describedby="description-helper-text"
                                                        label="Description"
                                                    />
                                                    <FormHelperText
                                                        id="description-helper-text">
                                                        {touched.description && Boolean(errors.description) ? errors.description : "Description of the collection, you can use markdown"}
                                                    </FormHelperText>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Typography sx={{ mt: 1 }}
                                                            variant={"subtitle2"}>
                                                    Schema
                                                </Typography>
                                                <Paper elevation={0}
                                                       variant={"outlined"}
                                                       sx={{
                                                           p: 2,
                                                           flexDirection: "column"
                                                       }}>
                                                    <FormControl fullWidth
                                                                 required
                                                                 disabled={isSubmitting}
                                                                 error={touched.schemaId && Boolean(errors.schemaId)}>
                                                        <Autocomplete
                                                            id={"schemaId"}
                                                            value={selectedSchema}
                                                            fullWidth
                                                            disableClearable
                                                            disabled={exitingCollection}
                                                            options={schemas}
                                                            onChange={(event, schema) => {
                                                                setFieldValue("schemaId", schema ? schema.id : null);
                                                            }}
                                                            getOptionLabel={(option) => option.name}
                                                            renderOption={(props, schema, { selected }) => (
                                                                <li {...props}>
                                                                    {schema.name}
                                                                </li>
                                                            )}
                                                            renderInput={(params) => (
                                                                <TextField {...params}
                                                                           required
                                                                           disabled={isSubmitting}
                                                                           InputProps={{
                                                                               ...params.InputProps,
                                                                               startAdornment:
                                                                                   <InputAdornment
                                                                                       position="start">
                                                                                       <AccountTreeIcon/>
                                                                                   </InputAdornment>
                                                                           }}
                                                                           name={"schemaId"}
                                                                           variant={"outlined"}
                                                                           label="Schema"/>
                                                            )}
                                                        />

                                                    </FormControl>
                                                    <Box sx={{
                                                        mt: 1,
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        justifyContent: "space-between"
                                                    }}>
                                                        <Button
                                                            variant={"outlined"}
                                                            disabled={!values.schemaId}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                setSelectedSchemaId(values.schemaId);
                                                                setSchemaDialogOpen(true);
                                                            }}
                                                            startIcon={
                                                                <SettingsIcon/>}>
                                                            Edit {selectedSchema?.name} schema
                                                        </Button>

                                                        {!exitingCollection &&
                                                            <Button
                                                                variant={values.schemaId ? "text" : "contained"}
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setSelectedSchemaId(undefined);
                                                                    setNewSchemaDialogOpen(true);
                                                                }}
                                                                startIcon={
                                                                    <AddIcon/>}>
                                                                Create new
                                                                schema
                                                            </Button>}
                                                    </Box>

                                                    <Typography
                                                        sx={{ mt: 2 }}
                                                        variant={"body2"}>
                                                        Each collection is
                                                        bound to one schema,
                                                        where the properties
                                                        of the stored values
                                                        are stored.
                                                    </Typography>
                                                    <Typography
                                                        sx={{ mb: 2 }}
                                                        variant={"body2"}>
                                                        You can only pick a
                                                        schema on the
                                                        collection creation,
                                                        but you can modify
                                                        the schema
                                                        afterwards
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Container>
                                <CustomDialogActions>

                                    {onCancel && <Button
                                        color="primary"
                                        disabled={isSubmitting}
                                        onClick={onCancel}
                                    >
                                        Cancel
                                    </Button>}

                                    <LoadingButton
                                        loading={isSubmitting}
                                        loadingPosition="start"
                                        disabled={!dirty}
                                        variant="contained"
                                        type="submit"
                                        startIcon={<SaveIcon/>}
                                    >
                                        Save
                                    </LoadingButton>
                                </CustomDialogActions>

                            </form>

                            {selectedSchemaId &&
                                <SchemaEditorDialog open={schemaDialogOpen}
                                                    handleClose={(schema) => {
                                                        if (schema)
                                                            setFieldValue("schemaId", schema.id);
                                                        setSelectedSchemaId(undefined);
                                                        setSchemaDialogOpen(false);
                                                    }}
                                                    schemaId={selectedSchemaId}/>}

                            <NewSchemaEditorDialog open={newSchemaDialogOpen}
                                                   handleClose={(schema) => {
                                                       if (schema)
                                                           setFieldValue("schemaId", schema.id);
                                                       setSelectedSchemaId(undefined);
                                                       setNewSchemaDialogOpen(false);
                                                   }}/>

                        </>
                    );
                }
                }
            </Formik>

        </>

    );
}
