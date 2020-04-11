import React from "react";
import Grid from "@material-ui/core/Grid";
import { Box, Button, Paper } from "@material-ui/core";
import { Entity, EntitySchema, EntityStatus, EntityValues } from "../models";
import { Form, Formik, FormikHelpers } from "formik";
import { formStyles } from "../styles";
import { createCustomIdField, createFormField } from "./index";
import { initEntityValues } from "../firebase/firestore";
import { getYupObjectSchema } from "./validation";

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
        throw new Error("Form wrongly configured");
    }

    function createFormFields(schema: EntitySchema, values: any, errors: any, touchedFields: any) {
        return <React.Fragment>
            {Object.entries(schema.properties).map(([key, property]) => {

                const value = values ? values[key] : undefined;
                const error = errors ? errors[key] : undefined;
                const touched = touchedFields ? touchedFields[key] : undefined;

                const formField = createFormField(key, property, value, true, error, touched);

                if (property.dataType === "array" && property.of.dataType === "map") {
                    return <Grid item xs={12}
                                 key={`field_${schema.name}_${key}`}>
                        {formField}
                    </Grid>;
                }

                if (property.dataType === "string" && property.storageMeta) {
                    return <Grid item xs={12}
                                 key={`field_${schema.name}_${key}`}>
                        {formField}
                    </Grid>;
                }

                return <Grid item xs={12} sm={6}
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
            onSubmit={saveValues}
            validationSchema={getYupObjectSchema(schema.properties)}
        >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => {
                return (
                    <Paper elevation={1} className={classes.formPaper}>
                        <Box margin={1}>
                            {createCustomIdField(schema, status, setCustomId, customIdError, entity?.id)}
                        </Box>
                        <Form className={classes.form} onSubmit={handleSubmit}
                              noValidate>
                            <Box padding={1}>
                                <Grid container spacing={3}>
                                    {createFormFields(schema, values, errors, touched)}
                                    {savingError && <Grid item xs={12}>
                                        <Box textAlign="right">
                                            {savingError}
                                        </Box>
                                    </Grid>}
                                    <Grid item xs={12}>
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
                                    </Grid>
                                </Grid>

                            </Box>
                        </Form>
                    </Paper>
                );
            }}
        </Formik>
    );
}
