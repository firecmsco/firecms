import React from "react";
import { Box, Button, Container, Grid, Paper } from "@material-ui/core";
import { Entity, EntitySchema, EntityStatus, EntityValues } from "../models";
import { Form, Formik, FormikHelpers } from "formik";
import { formStyles, useStyles } from "../styles";
import { createCustomIdField, createFormField } from "./index";
import { initEntityValues } from "../firebase/firestore";
import { getYupObjectSchema } from "./validation";
import { getColumnsForProperty } from "../util/layout";

interface EntityFormProps<S extends EntitySchema> {

    /**
     * New or existing status
     */
    status: EntityStatus;

    /**
     * Path of the collection this entity is located
     */
    collectionPath: string;

    /**
     * Schema of the entity this form represents
     */
    schema: S;

    /**
     * The updated entity is passed from the parent component when the underlying data
     * has changed in Firestore
     */
    entity?: Entity<S>;

    /**
     * The updated entity is passed from the parent component when the underlying data
     * has changed in Firestore
     */
    updatedEntity?: Entity<S>;

    /**
     * The callback function called when Save is clicked and validation is correct
     */
    onEntitySave(collectionPath: string, id: string | undefined, values: any): Promise<void>;

}

export default function EntityForm<S extends EntitySchema>({
                                                               status,
                                                               collectionPath,
                                                               schema,
                                                               entity,
                                                               onEntitySave
                                                           }: EntityFormProps<S>) {
    const classes = formStyles();


    const [customId, setCustomId] = React.useState<string | undefined>(undefined);
    const [customIdError, setCustomIdError] = React.useState<boolean>(false);
    const [savingError, setSavingError] = React.useState<any>();

    const mustSetCustomId: boolean = status === EntityStatus.new && !!schema.customId;

    let initialValues: EntityValues<S>;

    if (status === EntityStatus.new) {
        initialValues = initEntityValues(schema);
    } else if (status === EntityStatus.existing && entity) {
        initialValues = entity.values;
    } else {
        throw new Error("Form configured wrong");
    }

    function createFormFields(schema: EntitySchema) {

        const classes = useStyles();
        return <React.Fragment>
            {Object.entries(schema.properties).map(([key, property]) => {

                const formField = createFormField(key, property, true);
                const columns = getColumnsForProperty(property);

                return <Grid item sm={columns} className={classes.field}
                             key={`field_${schema.name}_${key}`}>
                    {formField}
                </Grid>;
            })}
        </React.Fragment>;
    }

    function saveValues(values: EntityValues<S>, actions: FormikHelpers<EntityValues<S>>) {

        if (mustSetCustomId && !customId) {
            console.error("Missing custom Id");
            setCustomIdError(true);
            actions.setSubmitting(false);
            return;
        }
        setSavingError(null);
        setCustomIdError(false);

        let id: string | undefined;
        if (status === EntityStatus.existing) {
            if (!entity?.id) throw Error("Form misconfigured when saving, no id for existing entity");
            id = entity.id;
        } else if (status === EntityStatus.new) {
            if (schema.customId) {
                if (!customId) throw Error("Form misconfigured when saving, customId should be set");
                id = customId;
            }
        } else {
            throw Error("New FormType added, check EntityForm");
        }

        onEntitySave(collectionPath, id, values)
            .catch(e => {
                console.error(e);
                setSavingError(e);
            })
            .finally(() => {
                actions.setSubmitting(false);
            });

    }

    return (
        <Formik
            initialValues={initialValues}
            validate={(values => console.debug("validate", values))}
            onSubmit={saveValues}
            validationSchema={getYupObjectSchema(schema.properties)}
        >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => {
                return (
                    <Paper elevation={1}>
                        <Container maxWidth={"md"}
                                   className={classes.formPaper}
                                   disableGutters={true}>

                            <Box margin={1}>
                                {createCustomIdField(schema, status, setCustomId, customIdError, entity?.id)}
                            </Box>

                            <Form className={classes.form}
                                  onSubmit={handleSubmit}
                                  noValidate>

                                <Box padding={1}>
                                    <Grid container spacing={3}>
                                        {createFormFields(schema)}
                                    </Grid>
                                </Box>

                                {savingError &&
                                <Box textAlign="right">
                                    {savingError}
                                </Box>}
                                <Box textAlign="right">
                                    {status === EntityStatus.existing &&
                                    <Button
                                        variant="text"
                                        color="primary"
                                        disabled={isSubmitting}
                                        className={classes.button}
                                        type="reset"
                                    >
                                        Discard
                                    </Button>}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                        disabled={isSubmitting}

                                        className={classes.button}
                                    >
                                        Save
                                    </Button>
                                </Box>
                            </Form>

                        </Container>
                    </Paper>
                );
            }}
        </Formik>
    );
}
