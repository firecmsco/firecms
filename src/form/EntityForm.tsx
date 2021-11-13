import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Grid, Theme, Typography } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import {
    CMSFormFieldProps,
    Entity,
    EntitySchema,
    EntityStatus,
    EntityValues,
    FormContext,
    Properties,
    Property
} from "../models";
import { Form, Formik, FormikHelpers } from "formik";
import { buildPropertyField } from "./form_factory";
import { CustomFieldValidator, getYupEntitySchema } from "./validation";
import deepEqual from "deep-equal";
import { ErrorFocus } from "./components/ErrorFocus";
import {
    computeSchemaProperties,
    initEntityValues,
    isHidden,
    isReadOnly
} from "../core/utils";
import { CustomIdField } from "./components/CustomIdField";
import { useDataSource } from "../hooks";

export const useStyles = makeStyles((theme: Theme) => createStyles({
    stickyButtons: {
        marginTop: theme.spacing(2),
        background: theme.palette.mode === "light" ? "rgba(255,255,255,0.6)" : "rgba(255, 255, 255, 0)",
        backdropFilter: "blur(4px)",
        borderTop: theme.palette.divider,
        position: "sticky",
        bottom: 0,
        zIndex: 200
    },
    container: {
        padding: theme.spacing(4),
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        [theme.breakpoints.down("lg")]: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            paddingTop: theme.spacing(3),
            paddingBottom: theme.spacing(3)
        },
        [theme.breakpoints.down("md")]: {
            padding: theme.spacing(2)
        }
    },
    button: {
        margin: theme.spacing(1)
    },
    form: {
        marginTop: theme.spacing(2)
    }
}));

/**
 *
 * @category Components
 */
export interface EntityFormProps<M extends { [Key: string]: any }> {

    /**
     * New or existing status
     */
    status: EntityStatus;

    /**
     * Path of the collection this entity is located
     */
    path: string;

    /**
     * Schema of the entity this form represents
     */
    schema: EntitySchema<M>;

    /**
     * The updated entity is passed from the parent component when the underlying data
     * has changed in the datasource
     */
    entity?: Entity<M>;

    /**
     * The callback function called when Save is clicked and validation is correct
     */
    onEntitySave?(
        props:
            {
                schema: EntitySchema<M>,
                path: string,
                entityId: string | undefined,
                values: EntityValues<M>,
                previousValues?: EntityValues<M>
            }
    ): Promise<void>;

    /**
     * The callback function called when discard is clicked
     */
    onDiscard?(): void;

    /**
     * The callback function when the form is dirty, so the values are different
     * from the original ones
     */
    onModified?(dirty: boolean): void;

    /**
     * The callback function when the form original values have been modified
     */
    onValuesChanged?(values?: EntityValues<M>): void;

}

/**
 * This is the form used internally by the CMS
 * @param status
 * @param path
 * @param schema
 * @param entity
 * @param onEntitySave
 * @param onDiscard
 * @param onModified
 * @param onValuesChanged
 * @constructor
 * @category Components
 */
export function EntityForm<M>({
                                  status,
                                  path,
                                  schema,
                                  entity,
                                  onEntitySave,
                                  onDiscard,
                                  onModified,
                                  onValuesChanged
                              }: EntityFormProps<M>) {

    const classes = useStyles();
    const dataSource = useDataSource();

    /**
     * Base values are the ones this view is initialized from, we use them to
     * compare them with underlying changes in the datasource
     */
    let baseDataSourceValues: Partial<EntityValues<M>>;
    if ((status === "existing" || status === "copy") && entity) {
        baseDataSourceValues = entity.values ?? {};
    } else if (status === "new") {
        baseDataSourceValues = initEntityValues(schema, path);
    } else {
        console.error({status, entity});
        throw new Error("Form has not been initialised with the correct parameters");
    }

    const formRef = React.useRef<HTMLDivElement>(null);

    const [customId, setCustomId] = React.useState<string | undefined>(undefined);
    const [customIdError, setCustomIdError] = React.useState<boolean>(false);
    const [savingError, setSavingError] = React.useState<any>();

    const initialValuesRef = React.useRef<EntityValues<M>>(entity?.values ?? baseDataSourceValues as EntityValues<M>);
    const initialValues = initialValuesRef.current;
    const [internalValue, setInternalValue] = useState<EntityValues<M> | undefined>(initialValues);

    const mustSetCustomId: boolean = (status === "new" || status === "copy") && !!schema.customId;

    const underlyingChanges: Partial<EntityValues<M>> = useMemo(() => {
        if (initialValues && status === "existing") {
            return Object.keys(schema.properties)
                .map((key) => {
                    const initialValue = (initialValues as any)[key];
                    const latestValue = (baseDataSourceValues as any)[key];
                    if (!deepEqual(initialValue, latestValue)) {
                        return { [key]: latestValue };
                    }
                    return {};
                })
                .reduce((a, b) => ({ ...a, ...b }), {}) as Partial<EntityValues<M>>;
        } else {
            return {};
        }
    }, [initialValues, baseDataSourceValues]);

    function saveValues(values: EntityValues<M>, formikActions: FormikHelpers<EntityValues<M>>) {

        if (mustSetCustomId && !customId) {
            console.error("Missing custom Id");
            setCustomIdError(true);
            formikActions.setSubmitting(false);
            return;
        }

        setSavingError(null);
        setCustomIdError(false);

        let entityId: string | undefined;
        if (status === "existing") {
            if (!entity?.id) throw Error("Form misconfiguration when saving, no id for existing entity");
            entityId = entity.id;
        } else if (status === "new" || status === "copy") {
            if (schema.customId) {
                if (!customId) throw Error("Form misconfiguration when saving, customId should be set");
                entityId = customId;
            }
        } else {
            throw Error("New FormType added, check EntityForm");
        }

        if (onEntitySave)
            onEntitySave({
                schema,
                path,
                entityId,
                values,
                previousValues: entity?.values
            })
                .then(_ => {
                    initialValuesRef.current = values;
                    formikActions.setTouched({});
                })
                .catch(e => {
                    console.error(e);
                    setSavingError(e);
                })
                .finally(() => {
                    formikActions.setSubmitting(false);
                });

    }


    const entityId = status === "existing" ? entity?.id : undefined;

    const uniqueFieldValidator: CustomFieldValidator = ({
                                                            name,
                                                            value,
                                                            property
                                                        }) => dataSource.checkUniqueField(path, name, value, property, entityId);

    const validationSchema = getYupEntitySchema(
        schema.properties,
        internalValue as Partial<EntityValues<M>> ?? {},
        path,
        uniqueFieldValidator,
        entityId);

    function buildButtons(isSubmitting: boolean, modified: boolean) {
        const disabled = isSubmitting || (!modified && status === "existing");
        return (
            <Box textAlign="right">

                {status === "existing" &&
                <Button
                    variant="text"
                    color="primary"
                    disabled={disabled}
                    className={classes.button}
                    type="reset"
                >
                    Discard
                </Button>}

                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={disabled}
                    className={classes.button}
                >
                    {status === "existing" && "Save"}
                    {status === "copy" && "Create copy"}
                    {status === "new" && "Create"}
                </Button>

            </Box>
        );
    }

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={saveValues}
            validationSchema={validationSchema}
            validate={(values) => console.debug("Validating", values)}
            onReset={() => onDiscard && onDiscard()}
        >
            {({
                  values,
                  touched,
                  setFieldValue,
                  handleSubmit,
                  isSubmitting,
                  dirty
              }) => {

                const modified = useMemo(() => !deepEqual(baseDataSourceValues, values), [baseDataSourceValues, values]);
                useEffect(() => {
                    if (onModified)
                        onModified(modified);
                    setInternalValue(values);
                    if (onValuesChanged)
                        onValuesChanged(values);
                }, [modified, values]);

                if (underlyingChanges && entity) {
                    // we update the form fields from the Firestore data
                    // if they were not touched
                    Object.entries(underlyingChanges).forEach(([key, value]) => {
                        const formValue = (values as any)[key];
                        if (!deepEqual(value, formValue) && !(touched as any)[key]) {
                            console.debug("Updated value from the datasource:", key, value);
                            setFieldValue(key, value !== undefined ? value : null);
                        }
                    });
                }
                const context: FormContext<M> = {
                    schema: schema,
                    entityId: entityId,
                    values
                };

                const schemaProperties: Properties<M> = computeSchemaProperties(schema, path, entityId, values as EntityValues<M>);
                const formFields = (
                    <Grid container spacing={4}>

                        {Object.entries<Property>(schemaProperties)
                            .filter(([key, property]) => !isHidden(property))
                            .map(([key, property]) => {

                                const underlyingValueHasChanged: boolean =
                                    !!underlyingChanges
                                    && Object.keys(underlyingChanges).includes(key)
                                    && !!(touched as any)[key];

                                const dependsOnOtherProperties = typeof (schema.properties as any)[key] === "function";

                                const disabled = isSubmitting || isReadOnly(property) || Boolean(property.disabled);
                                const cmsFormFieldProps: CMSFormFieldProps = {
                                    name: key,
                                    disabled: disabled,
                                    property: property,
                                    includeDescription: true,
                                    underlyingValueHasChanged: underlyingValueHasChanged,
                                    context: context,
                                    tableMode: false,
                                    partOfArray: false,
                                    autoFocus: false,
                                    dependsOnOtherProperties: dependsOnOtherProperties
                                };
                                return (
                                    <Grid item
                                          xs={12}
                                          id={`form_field_${key}`}
                                          key={`field_${schema.name}_${key}`}>
                                        {buildPropertyField(cmsFormFieldProps)}
                                    </Grid>
                                );
                            })}

                    </Grid>
                );

                return (
                    <Container maxWidth={"sm"}
                               className={classes.container}
                               ref={formRef}>

                        <CustomIdField schema={schema as EntitySchema}
                                       status={status}
                                       onChange={setCustomId}
                                       error={customIdError}
                                       entity={entity}/>

                        <Form className={classes.form}
                              onSubmit={handleSubmit}
                              noValidate>

                            <Box pt={3}>
                                {formFields}
                            </Box>

                            <div className={classes.stickyButtons}>

                                {savingError &&
                                <Box textAlign="right">
                                    <Typography color={"error"}>
                                        {savingError.message}
                                    </Typography>
                                </Box>}

                                {buildButtons(isSubmitting, modified)}

                            </div>

                        </Form>


                        <ErrorFocus containerRef={formRef}/>

                    </Container>
                );
            }}
        </Formik>
    );
}
