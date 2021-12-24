import {
    Autocomplete,
    Box,
    Button,
    Container,
    Dialog,
    DialogTitle,
    FilledInput,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';


import * as Yup from 'yup';
import { Formik } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useConfigurationPersistence } from "../../../hooks/useConfigurationPersistence";
import { EntityCollection } from "../../../models";
import { CircularProgressCenter } from "../CircularProgressCenter";
import { ErrorView } from "../ErrorView";
import { useNavigation, useSnackbarController } from "../../../hooks";
import { findSchema } from "../../utils";
import { SchemaEditorPersistence } from "./SchemaEditorPersistence";
import {
    computeTopNavigation,
    TopNavigationResult
} from "../../util/navigation_utils";

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
    name: Yup.string().required('Required'),
    path: Yup.string().required('Required'),
    schemaId: Yup.string().required('Required'),
});

export function CollectionEditor<M>({
                                        path,
                                    }: CollectionEditorProps<M>) {

    const location = useLocation();
    const group = (location.state as any)?.group;
    const navigationContext = useNavigation();
    const snackbarController = useSnackbarController();

    const schemas = navigationContext.schemas;

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

    const isNewCollection = !Boolean(collection);

    const initialValues = collection ?? {
        name: "",
        path: path ?? "",
        schemaId: "",
        group
    };

    const onSubmit = (values: EntityCollection) => {
        const cleanValues = {
            ...values,
            group: values.group ?? undefined
        };
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
                      setFieldValue,
                      handleChange,
                      handleSubmit,
                      isSubmitting,
                      dirty
                  }) => {

                    const formControlSX = {
                        '& .MuiInputLabel-root': {
                            mt: 1 / 2,
                            ml: 1 / 2,
                        },
                        '& .MuiInputLabel-shrink': {
                            mt: -1 / 4
                        },
                    };
                    let selectedSchema = values.schemaId ? findSchema(values.schemaId, schemas) : undefined;
                    return <Container maxWidth={"sm"}>
                        <form onSubmit={handleSubmit}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    p: 3
                                }}>
                                <Typography variant={"h6"}>
                                    {path ? "Edit collection" : "New collection"}
                                </Typography>

                                <Paper elevation={0} sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    my: 1,
                                    p: 2
                                }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth
                                                         variant="filled"
                                                         sx={formControlSX}>
                                                <InputLabel
                                                    htmlFor="name">Name</InputLabel>
                                                <FilledInput
                                                    id="name"
                                                    aria-describedby="name-helper"
                                                    onChange={handleChange}
                                                    value={values.name}
                                                    sx={{ minHeight: "64px" }}
                                                />
                                                <FormHelperText
                                                    id="name-helper">
                                                    Plural name (e.g. Products)
                                                </FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FormControl fullWidth
                                                         variant="filled"
                                                         sx={formControlSX}>
                                                <InputLabel
                                                    htmlFor="path">{"Path"}</InputLabel>
                                                <FilledInput id={"path"}
                                                             aria-describedby={`${"path"}-helper`}
                                                             onChange={handleChange}
                                                             value={values.path}
                                                             disabled={!isNewCollection}
                                                             sx={{ minHeight: "64px" }}/>
                                                <FormHelperText
                                                    id="path-helper">
                                                    {"Path that this collection is stored in"}
                                                </FormHelperText>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12}>
                                            <FormControl fullWidth
                                                         variant="filled"
                                                         sx={formControlSX}>
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
                                                                   aria-describedby={`group-helper`}
                                                                   variant={"filled"}
                                                                   label="Group"
                                                                   sx={{ minHeight: "64px" }}/>
                                                    )}
                                                />
                                                <FormHelperText
                                                    id="group-helper">
                                                    {"Group of the collection"}
                                                </FormHelperText>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Paper elevation={0} variant={"outlined"} sx={{ p: 2 }}>
                                                <FormControl fullWidth
                                                             variant="filled"
                                                             sx={formControlSX}>
                                                    <Autocomplete
                                                        id={"schemaId"}
                                                        value={selectedSchema}
                                                        sx={{ minHeight: "64px" }}
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
                                                                       variant={"filled"}
                                                                       label="Schema"
                                                                       sx={{ minHeight: "64px" }}/>
                                                        )}
                                                    />

                                                </FormControl>

                                                <Button
                                                    disabled={!values.schemaId}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setSelectedSchemaId(values.schemaId);
                                                    }}
                                                    endIcon={<SettingsIcon/>}>
                                                    Edit {selectedSchema?.name} schema
                                                </Button>
                                            </Paper>
                                        </Grid>
                                    </Grid>
                                </Paper>

                                <Button type="submit">Save</Button>
                            </Box>
                        </form>
                    </Container>;
                }
                }
            </Formik>

            {selectedSchemaId &&
            <SchemaEditorDialog open={Boolean(selectedSchemaId)}
                                handleOk={() => {
                                    setSelectedSchemaId(undefined)
                                }}
                                schemaId={selectedSchemaId}/>}
        </>

    );
}


export interface SchemaEditorDialogProps {
    open: boolean;
    handleOk: () => void;
    schemaId: string;
}


export function SchemaEditorDialog({
                                       open,
                                       handleOk,
                                       schemaId
                                   }: SchemaEditorDialogProps) {

    return (
        <Dialog
            open={open}
            maxWidth={"lg"}
            fullWidth
            onClose={handleOk}
            sx={{
                height: "100vh"
            }}
        >
            <DialogTitle id="alert-dialog-title">
                {"Schema"}
            </DialogTitle>
            <SchemaEditorPersistence schemaId={schemaId}/>

            <Box sx={(theme) => ({
                marginTop: theme.spacing(2),
                background: theme.palette.mode === "light" ? "rgba(255,255,255,0.6)" : "rgba(255, 255, 255, 0)",
                backdropFilter: "blur(4px)",
                borderTop: `1px solid ${theme.palette.divider}`,
                py: 1,
                px: 2,
                position: "sticky",
                bottom: 0,
                zIndex: 200,
                textAlign: "right"
            })}
            >

                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    onClick={handleOk}
                >
                    Ok
                </Button>

            </Box>
        </Dialog>
    );
}

