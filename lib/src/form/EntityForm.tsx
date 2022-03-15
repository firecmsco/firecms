import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import {
    CMSFormFieldProps,
    Entity,
    EntitySchema,
    EntityStatus,
    EntityValues,
    FormContext,
    ResolvedEntitySchema,
    ResolvedProperty
} from "../models";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import { buildPropertyField } from "./form_factory";
import { CustomFieldValidator, getYupEntitySchema } from "./validation";
import equal from "react-fast-compare"
import { ErrorFocus } from "./components/ErrorFocus";
import {
    getDefaultValuesFor,
    isHidden,
    isReadOnly
} from "../core/util/entities";
import { CustomIdField } from "./components/CustomIdField";
import { useDataSource } from "../hooks";
import { useSchemaRegistry } from "../hooks/useSchemaRegistry";
import { CustomDialogActions } from "../core/components/CustomDialogActions";

/**
 * @category Components
 */
export interface EntityFormProps<M> {

    /**
     * New or existing status
     */
    status: EntityStatus;

    /**
     * Path of the collection this entity is located
     */
    path: string;

    /**
     * The schema is used to build the fields of the form
     */
    schema: string | EntitySchema<M>

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
                schema: ResolvedEntitySchema<M>,
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
                                  schema: inputSchema,
                                  entity,
                                  onEntitySave,
                                  onDiscard,
                                  onModified,
                                  onValuesChanged
                              }: EntityFormProps<M>) {

    const dataSource = useDataSource();
    const schemaRegistry = useSchemaRegistry();

    const initialResolvedSchema = useMemo(() => schemaRegistry.getResolvedSchema({
        schema: inputSchema,
        path,
        values: entity?.values
    }), [inputSchema, path]);

    const mustSetCustomId: boolean = (status === "new" || status === "copy") &&
        (Boolean(initialResolvedSchema.customId) && initialResolvedSchema.customId !== "optional");

    const inputEntityId = useMemo(() => {
        if ((status === "new" || status === "copy") && initialResolvedSchema.customId === "optional")
            return dataSource.generateEntityId(path);
        return mustSetCustomId ? undefined : (entity?.id ?? dataSource.generateEntityId(path));
    }, []);

    const baseDataSourceValues: Partial<EntityValues<M>> = useMemo(() => {
        const properties = initialResolvedSchema.properties;
        if ((status === "existing" || status === "copy") && entity) {
            return entity.values ?? getDefaultValuesFor(properties);
        } else if (status === "new") {
            return getDefaultValuesFor(properties);
        } else {
            console.error({ status, entity });
            throw new Error("Form has not been initialised with the correct parameters");
        }
    }, [status, initialResolvedSchema, entity]);

    const formRef = React.useRef<HTMLDivElement>(null);

    const [entityId, setEntityId] = React.useState<string | undefined>(inputEntityId);
    const [entityIdError, setEntityIdError] = React.useState<boolean>(false);
    const [savingError, setSavingError] = React.useState<Error | undefined>();

    const initialValuesRef = React.useRef<EntityValues<M>>(entity?.values ?? baseDataSourceValues as EntityValues<M>);
    const initialValues = initialValuesRef.current;

    const [internalValue, setInternalValue] = useState<EntityValues<M> | undefined>(initialValues);

    const schema = useMemo(() => schemaRegistry.getResolvedSchema<M>({
        schema: inputSchema,
        path,
        entityId,
        values: internalValue,
        previousValues: initialValues
    }), [schemaRegistry, inputSchema, path, entityId, internalValue, initialValues]);

    const underlyingChanges: Partial<EntityValues<M>> = useMemo(() => {
        if (initialValues && status === "existing") {
            return Object.keys(schema.properties)
                .map((key) => {
                    const initialValue = (initialValues as any)[key];
                    const latestValue = (baseDataSourceValues as any)[key];
                    if (!equal(initialValue, latestValue)) {
                        return { [key]: latestValue };
                    }
                    return {};
                })
                .reduce((a, b) => ({ ...a, ...b }), {}) as Partial<EntityValues<M>>;
        } else {
            return {};
        }
    }, [initialValues, baseDataSourceValues]);

    const saveValues = useCallback((values: EntityValues<M>, formikActions: FormikHelpers<EntityValues<M>>) => {

        if (mustSetCustomId && !entityId) {
            console.error("Missing custom Id");
            setEntityIdError(true);
            formikActions.setSubmitting(false);
            return;
        }

        setSavingError(undefined);
        setEntityIdError(false);

        let savedEntityId: string | undefined;
        if (status === "existing") {
            if (!entity?.id) throw Error("Form misconfiguration when saving, no id for existing entity");
            savedEntityId = entity.id;
        } else if (status === "new" || status === "copy") {
            if (schema.customId) {
                if (schema.customId !== "optional" && !entityId) {
                    throw Error("Form misconfiguration when saving, entityId should be set");
                }
                savedEntityId = entityId;
            }
        } else {
            throw Error("New FormType added, check EntityForm");
        }

        if (onEntitySave)
            onEntitySave({
                schema: schema,
                path,
                entityId: savedEntityId,
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

    }, [status, path, schema, entity, onEntitySave, mustSetCustomId, entityId]);

    const uniqueFieldValidator: CustomFieldValidator = useCallback(({
                                                                        name,
                                                                        value,
                                                                        property
                                                                    }) => dataSource.checkUniqueField(path, name, value, property, entityId),
        [dataSource, path, entityId]);

    const validationSchema = useMemo(() => getYupEntitySchema(
        schema.properties,
        uniqueFieldValidator), [schema.properties]);

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={saveValues}
            validationSchema={validationSchema}
            validate={(values) => console.debug("Validating", values)}
            onReset={() => onDiscard && onDiscard()}
        >
            {(props) => {
                return <>

                    <Box
                        sx={(theme) => ({
                            width: "100%",
                            marginTop: theme.spacing(3),
                            paddingLeft: theme.spacing(4),
                            paddingRight: theme.spacing(4),
                            paddingTop: theme.spacing(3),
                            [theme.breakpoints.down("lg")]: {
                                marginTop: theme.spacing(2),
                                paddingLeft: theme.spacing(2),
                                paddingRight: theme.spacing(2),
                                paddingTop: theme.spacing(2),
                            },
                            [theme.breakpoints.down("md")]: {
                                marginTop: theme.spacing(1),
                                paddingLeft: theme.spacing(2),
                                paddingRight: theme.spacing(2),
                                paddingTop: theme.spacing(2)
                            }
                        })}>
                        <CustomIdField customId={schema.customId}
                                       entityId={entityId}
                                       status={status}
                                       onChange={setEntityId}
                                       error={entityIdError}
                                       entity={entity}/>
                    </Box>

                    {entityId && <FormInternal
                        {...props}
                        baseDataSourceValues={baseDataSourceValues}
                        onModified={onModified}
                        setInternalValue={setInternalValue}
                        onValuesChanged={onValuesChanged}
                        underlyingChanges={underlyingChanges}
                        path={path}
                        entity={entity}
                        entityId={entityId}
                        schema={schema}
                        formRef={formRef}
                        status={status}
                        entityIdError={entityIdError}
                        savingError={savingError}/>}

                </>
            }
            }
        </Formik>
    );
}

function FormInternal<M>({
                             baseDataSourceValues,
                             values,
                             onModified,
                             setInternalValue,
                             onValuesChanged,
                             underlyingChanges,
                             entityId,
                             entity,
                             touched,
                             setFieldValue,
                             schema,
                             path,
                             isSubmitting,
                             formRef,
                             status,
                             handleSubmit,
                             savingError
                         }: FormikProps<M> & {
    baseDataSourceValues: Partial<M>,
    onModified: ((modified: boolean) => void) | undefined,
    setInternalValue: any,
    onValuesChanged?: (changedValues?: EntityValues<M>) => void,
    underlyingChanges: Partial<M>,
    path: string
    entityIdError: boolean,
    entity: Entity<M> | undefined,
    schema: ResolvedEntitySchema<M>,
    entityId: string,
    formRef: any,
    status: "new" | "existing" | "copy",
    savingError?: Error,
}) {
    const modified = useMemo(() => !equal(baseDataSourceValues, values), [baseDataSourceValues, values]);
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
            if (!equal(value, formValue) && !(touched as any)[key]) {
                console.debug("Updated value from the datasource:", key, value);
                setFieldValue(key, value !== undefined ? value : null);
            }
        });
    }

    const context: FormContext<M> = {
        schema,
        entityId,
        values,
        path
    };

    const formFields = (
        <Grid container spacing={4}>
            {Object.entries<ResolvedProperty>(schema.properties)
                .filter(([key, property]) => !isHidden(property))
                .map(([key, property]) => {

                    const underlyingValueHasChanged: boolean =
                        !!underlyingChanges &&
                        Object.keys(underlyingChanges).includes(key) &&
                        !!touched[key];

                    const shouldAlwaysRerender = typeof (schema.originalSchema.properties)[key] === "function";

                    const disabled = isSubmitting || isReadOnly(property) || Boolean(property.disabled);
                    const cmsFormFieldProps: CMSFormFieldProps = {
                        propertyKey: key,
                        disabled,
                        property,
                        includeDescription: true,
                        underlyingValueHasChanged,
                        context,
                        tableMode: false,
                        partOfArray: false,
                        autoFocus: false,
                        shouldAlwaysRerender
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

    const disabled = isSubmitting || (!modified && status === "existing");

    return (

        <Form onSubmit={handleSubmit}
              noValidate>
            <Box
                sx={(theme) => ({
                    paddingLeft: theme.spacing(4),
                    paddingRight: theme.spacing(4),
                    paddingTop: theme.spacing(3),
                    paddingBottom: theme.spacing(4),
                    marginBottom: theme.spacing(2),
                    [theme.breakpoints.down("lg")]: {
                        paddingLeft: theme.spacing(2),
                        paddingRight: theme.spacing(2),
                        paddingTop: theme.spacing(2),
                        paddingBottom: theme.spacing(3)
                    },
                    [theme.breakpoints.down("md")]: {
                        padding: theme.spacing(2)
                    }
                })}
                ref={formRef}>

                {formFields}

                <ErrorFocus containerRef={formRef}/>

            </Box>

            <Box sx={{ height: 56 }}/>

            <CustomDialogActions position={"absolute"}>

                {savingError &&
                    <Box textAlign="right">
                        <Typography color={"error"}>
                            {savingError.message}
                        </Typography>
                    </Box>}

                {status === "existing" &&
                    <Button
                        variant="text"
                        color="primary"
                        disabled={disabled}
                        type="reset"
                    >
                        Discard
                    </Button>}

                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={disabled}
                >
                    {status === "existing" && "Save"}
                    {status === "copy" && "Create copy"}
                    {status === "new" && "Create"}
                </Button>

            </CustomDialogActions>
        </Form>
    );
}

export default EntityForm;
