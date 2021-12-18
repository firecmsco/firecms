import {
    Box,
    Button,
    Container,
    FilledInput,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    Paper,
    Typography
} from "@mui/material";
import * as Yup from 'yup';
import { Formik } from "formik";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useConfigurationPersistence } from "../../../hooks/useConfigurationPersistence";
import { StoredEntityCollection } from "../../../models/config_persistence";
import { EntityCollection } from "../../../models";
import { CircularProgressCenter } from "../CircularProgressCenter";
import { ErrorView } from "../ErrorView";

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
    path: Yup.string().required('Required')
});

export function CollectionEditor<M>({
                                        path
                                    }: CollectionEditorProps<M>) {

    const location = useLocation();
    const { group } = location.state;

    const configurationPersistence = useConfigurationPersistence();
    if (!configurationPersistence)
        throw Error("Can't edit a collection with no `ConfigurationPersistence` specified");

    const [collection, setCollection] = useState<StoredEntityCollection | undefined>();
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

    const initialValues = collection ?? {
        name: "",
        path: path ?? "",
        group
    };

    const onSubmit = (values: any) => {
        configurationPersistence.saveCollection(values.path, values);
        alert(JSON.stringify(values, null, 2));
    };

    return (<Formik
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
                                                     sx={{
                                                         '& .MuiInputLabel-root': {
                                                             mt: 1 / 2,
                                                             ml: 1 / 2,
                                                         },
                                                         '& .MuiInputLabel-shrink': {
                                                             mt: -1 / 4
                                                         },
                                                     }}>
                                            <InputLabel
                                                htmlFor="name">Name</InputLabel>
                                            <FilledInput
                                                id="name"
                                                aria-describedby="name-helper"
                                                onChange={handleChange}
                                                value={values.name}
                                                sx={{ minHeight: "64px" }}
                                            />
                                            <FormHelperText id="name-helper">
                                                Plural name (e.g. Products)
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth
                                                     variant="filled"
                                                     sx={{
                                                         '& .MuiInputLabel-root': {
                                                             mt: 1 / 2,
                                                             ml: 1 / 2,
                                                         },
                                                         '& .MuiInputLabel-shrink': {
                                                             mt: -1 / 4
                                                         },
                                                     }}>
                                            <InputLabel
                                                htmlFor="path">Path</InputLabel>
                                            <FilledInput id="path"
                                                         aria-describedby="path-helper"
                                                         onChange={handleChange}
                                                         value={values.path}
                                                         sx={{ minHeight: "64px" }}/>
                                            <FormHelperText id="path-helper">
                                                Path that this collection is
                                                stored
                                                in
                                            </FormHelperText>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Paper>

                            <Button type="submit">Save</Button>
                        </Box>
                    </form>
                </Container>;
            }
            }</Formik>

    )
        ;
}