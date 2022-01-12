import {
    Autocomplete,
    Box,
    Button,
    Container,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    OutlinedInput,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";

import * as Yup from "yup";
import { Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { Link as ReactLink, useLocation } from "react-router-dom";
import { useConfigurationPersistence } from "../../../hooks/useConfigurationPersistence";
import { EntityCollection } from "../../../models";
import { CircularProgressCenter } from "../CircularProgressCenter";
import { ErrorView } from "../ErrorView";
import { useNavigation, useSnackbarController } from "../../../hooks";
import { SchemaEditorDialog } from "./SchemaEditorPersistence";
import {
    computeTopNavigation,
    TopNavigationResult
} from "../../util/navigation_utils";
import { useSchemaRegistry } from "../../../hooks/useSchemaRegistry";
import { SubmitListener } from "./SchemaEditor";

/**
 * @category Components
 */
export interface CollectionEditorProps<M> {

    /**
     * Absolute path this collection view points to
     */
    path?: string;

}

const CollectionSchema = Yup.object().shape({
    name: Yup.string().required("Required"),
    path: Yup.string().required("Required"),
    schemaId: Yup.string().required("Required")
});

export function CollectionEditor<M>({
                                        path
                                    }: CollectionEditorProps<M>) {

    const location = useLocation();
    const group = (location.state as any)?.group;
    const navigationContext = useNavigation();
    const schemaRegistry = useSchemaRegistry();
    const snackbarController = useSnackbarController();

    const schemas = schemaRegistry.schemas;

    const [schemaDialogOpen, setSchemaDialogOpen] = useState<boolean>(false);
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

    const onSubmit = (values: EntityCollection) => {
        const cleanValues = {
            ...values
        };
        console.log("onSubmit", cleanValues);
        configurationPersistence
            .saveCollection(values.path, cleanValues)
            .then(() => snackbarController.open({
                type: "success",
                message: "Collection updated"
            }))
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

                    console.log("errors", touched, errors);

                    const selectedSchema = values.schemaId ? schemaRegistry.findSchema(values.schemaId) : undefined;
                    return (
                        <Container maxWidth={"md"}>
                            <form onSubmit={handleSubmit}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        p: 3
                                    }}>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            py: 3
                                        }}>
                                        <Typography variant={"h4"}>
                                            {isNewCollection ? "New collection" : `${values.name} collection`}
                                        </Typography>
                                        {path && <Button
                                            variant="contained"
                                            component={ReactLink}
                                            to={navigationContext.buildUrlCollectionPath(path)}>
                                            Go to collection
                                        </Button>}
                                    </Box>

                                    <Paper elevation={0} sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        my: 1,
                                        p: 2
                                    }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <FormControl fullWidth
                                                             variant="outlined"
                                                             error={touched.path && Boolean(errors.path)}>
                                                    <InputLabel
                                                        htmlFor="path">{"Path"}</InputLabel>
                                                    <OutlinedInput id={"path"}
                                                                   aria-describedby={`${"path"}-helper`}
                                                                   onChange={handleChange}
                                                                   value={values.path}
                                                                   disabled={!isNewCollection}/>
                                                    <FormHelperText
                                                        id="path-helper">
                                                        {touched.path && Boolean(errors.path) ? errors.path : "Path that this collection is stored in"}
                                                    </FormHelperText>
                                                </FormControl>
                                        </Grid>
                                        <Grid item xs={12} sm={8}>
                                            <FormControl fullWidth
                                                         error={touched.name && Boolean(errors.name)}
                                                         // variant="outlined"
                                            >
                                                <InputLabel
                                                    htmlFor="name">Name</InputLabel>
                                                <OutlinedInput
                                                    id="name"
                                                    aria-describedby="name-helper"
                                                    onChange={handleChange}
                                                    value={values.name}
                                                />
                                                <FormHelperText
                                                    id="name-helper">
                                                    {touched.name && Boolean(errors.name) ? errors.name : "Plural name of the collection (e.g. Products)"}
                                                </FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} sm={4}>
                                            <FormControl fullWidth
                                                         error={touched.group && Boolean(errors.group)}
                                                         variant="outlined"
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
                                                         error={touched.description && Boolean(errors.description)}
                                                         variant="outlined"
                                            >
                                                <InputLabel
                                                    htmlFor="description">Description</InputLabel>
                                                <OutlinedInput
                                                    id="description"
                                                    aria-describedby="description-helper"
                                                    onChange={handleChange}
                                                    value={values.description}
                                                />
                                                <FormHelperText
                                                    id="description-helper">
                                                    {touched.description && Boolean(errors.description) ? errors.description : "Description of the collection"}
                                                </FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Typography sx={{ mt: 2 }}
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
                                                             variant="outlined"
                                                >
                                                    <Autocomplete
                                                        id={"schemaId"}
                                                        value={selectedSchema}
                                                        fullWidth
                                                        disableClearable
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
                                                        variant="contained"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setSelectedSchemaId(undefined);
                                                            setSchemaDialogOpen(true);
                                                        }}
                                                        startIcon={<AddIcon/>}>
                                                        Create new schema
                                                    </Button>

                                                    <Button
                                                        disabled={!values.schemaId}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setSelectedSchemaId(values.schemaId);
                                                            setSchemaDialogOpen(true);
                                                        }}
                                                        startIcon={
                                                            <SettingsIcon/>}>
                                                        Edit {selectedSchema?.name}
                                                    </Button>
                                                </Box>
                                            </Paper>
                                        </Grid>
                                        </Grid>
                                    </Paper>

                                    {isNewCollection
                                        ? <Button type="submit">Save</Button>
                                        : <SubmitListener/>}

                                </Box>
                            </form>

                            <SchemaEditorDialog open={schemaDialogOpen}
                                                handleClose={(schema) => {
                                                    if (schema)
                                                        setFieldValue("schemaId", schema.id);
                                                    setSelectedSchemaId(undefined);
                                                    setSchemaDialogOpen(false);
                                                }}
                                                schemaId={selectedSchemaId}/>

                        </Container>
                    );
                }
                }
            </Formik>

        </>

    );
}
