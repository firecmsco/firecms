import React from "react";
import {
    Box,
    Button,
    Container,
    Grid,
    Paper,
    Typography
} from "@material-ui/core";
import { Entity, EntitySchema, EntityStatus, EntityValues } from "../models";
import { Form, Formik, FormikHelpers } from "formik";
import { formStyles, useStyles } from "../styles";
import { createCustomIdField, createFormField } from "./index";
import { initEntityValues } from "../firebase/firestore";
import { getYupObjectSchema } from "./validation";
import { getColumnsForProperty } from "../util/layout";
import deepEqual from "deep-equal";

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
     * The callback function called when Save is clicked and validation is correct
     */
    onEntitySave(schema: S, collectionPath: string, id: string | undefined, values: EntityValues<S>): Promise<void>;

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
    const [initialValues, setInitialValues] = React.useState<EntityValues<S> | undefined>(entity?.values);

    /**
     * Base values are the ones this view is initialized from, we use them to
     * compare them with underlying changes in Firestore
     */
    let baseValues: EntityValues<S>;
    if (status === EntityStatus.new) {
        baseValues = (initEntityValues(schema));
    } else if (status === EntityStatus.existing && entity) {
        baseValues = entity.values as EntityValues<S>;
    } else {
        throw new Error("Form configured wrong");
    }

    let underlyingChanges: Partial<EntityValues<S>> | undefined;
    if (initialValues) {
        underlyingChanges = Object.keys(schema.properties)
            .map((key) => {
                const initialValue = initialValues[key];
                const latestValue = baseValues[key];
                if (!deepEqual(initialValue, latestValue)) {
                    return { [key]: latestValue };
                }
                return {};
            })
            .reduce((a, b) => ({ ...a, ...b }), {}) as EntityValues<S>;
    }

    const mustSetCustomId: boolean = status === EntityStatus.new && !!schema.customId;

    function saveValues(values: EntityValues<S>, actions: FormikHelpers<EntityValues<S>>) {

        console.log("Saving values", values);

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
            if (!entity?.id) throw Error("Form misconfiguration when saving, no id for existing entity");
            id = entity.id;
        } else if (status === EntityStatus.new) {
            if (schema.customId) {
                if (!customId) throw Error("Form misconfiguration when saving, customId should be set");
                id = customId;
            }
        } else {
            throw Error("New FormType added, check EntityForm");
        }

        onEntitySave(schema, collectionPath, id, values)
            .then(_ => {
                setInitialValues(values);
                actions.setTouched({});
            })
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
            initialValues={baseValues as EntityValues<S>}
            onSubmit={saveValues}
            validationSchema={getYupObjectSchema(schema.properties)}
        >
            {({ values, touched, setFieldValue, setFieldTouched, handleSubmit, isSubmitting }) => {

                if (underlyingChanges && entity) {

                    // we update the form fields from the Firestore data
                    // if they were not touched
                    Object.entries(underlyingChanges).forEach(([key, value]) => {
                        const formValue = values[key];
                        if (!deepEqual(value, formValue) && !touched[key]) {
                            setFieldValue(key, !!value ? value : null);
                            setFieldTouched(key, false);
                        }
                    });

                }

                function createFormFields(schema: EntitySchema) {

                    const classes = useStyles();

                    return <Grid container spacing={3}>
                        {Object.entries(schema.properties).map(([key, property]) => {

                            const underlyingValueHasChanged: boolean =
                                !!underlyingChanges
                                && Object.keys(underlyingChanges).includes(key)
                                && !!touched[key];

                            const formField = createFormField(key, property, true, underlyingValueHasChanged);
                            const columns = getColumnsForProperty(property);

                            return <Grid item sm={columns}
                                         className={classes.field}
                                         key={`field_${schema.name}_${key}`}>
                                {formField}
                            </Grid>;
                        })}
                    </Grid>;
                }

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
                                    {createFormFields(schema)}
                                </Box>

                                {savingError &&
                                <Box textAlign="right">
                                    <Typography color={"error"}>
                                        Error saving to Firestore. Details in the console
                                    </Typography>
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
