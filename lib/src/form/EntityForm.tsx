import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import {
    CMSFormFieldProps,
    Entity,
    EntitySchema,
    EntitySchemaResolver,
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
    computeSchema,
    initWithProperties,
    isHidden,
    isReadOnly
} from "../core/utils";
import { CustomIdField } from "./components/CustomIdField";
import { useDataSource } from "../hooks";
import { useSchemaRegistry } from "../hooks/useSchemaRegistry";

/**
 *
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
     * Use to resolve the schema properties for specific path, entity id or values
     */
    schemaOrResolver: EntitySchema<M> | EntitySchemaResolver<M>;

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
 * @param schemaOrResolver
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
                                  schemaOrResolver,
                                  entity,
                                  onEntitySave,
                                  onDiscard,
                                  onModified,
                                  onValuesChanged
                              }: EntityFormProps<M>) {

    const dataSource = useDataSource();
    const schemaRegistry = useSchemaRegistry();

    /**
     * Base values are the ones this view is initialized from, we use them to
     * compare them with underlying changes in the datasource
     */
    const entityId = status === "existing" ? entity?.id : undefined;
    const schemaResolver = useMemo(() => schemaRegistry.buildSchemaResolver({
        schema: schemaOrResolver,
        path
    }), [schemaOrResolver, path]);

    const initialResolvedSchema: ResolvedEntitySchema<M> = useMemo(() => computeSchema({
        schemaResolver: schemaResolver,
        entityId,
        values: entity?.values
    }), [path, entityId, schemaResolver]);

    const baseDataSourceValues: Partial<EntityValues<M>> = useMemo(() => {
        const properties = initialResolvedSchema.properties;
        if ((status === "existing" || status === "copy") && entity) {
            return entity.values ?? initWithProperties(properties, initialResolvedSchema.defaultValues);
        } else if (status === "new") {
            return initWithProperties(properties, initialResolvedSchema.defaultValues);
        } else {
            console.error({ status, entity });
            throw new Error("Form has not been initialised with the correct parameters");
        }
    }, [status, initialResolvedSchema, entity]);

    const formRef = React.useRef<HTMLDivElement>(null);

    const [customId, setCustomId] = React.useState<string | undefined>(undefined);
    const [customIdError, setCustomIdError] = React.useState<boolean>(false);
    const [savingError, setSavingError] = React.useState<Error | undefined>();

    const initialValuesRef = React.useRef<EntityValues<M>>(entity?.values ?? baseDataSourceValues as EntityValues<M>);
    const initialValues = initialValuesRef.current;

    const [internalValue, setInternalValue] = useState<EntityValues<M> | undefined>(initialValues);

    const schema: ResolvedEntitySchema<M> = useMemo(() => computeSchema({
        schemaResolver: schemaResolver,
        entityId,
        values: internalValue,
        previousValues: initialValues
    }), [schemaResolver, path, entityId, internalValue]);

    const mustSetCustomId: boolean = (status === "new" || status === "copy") && (!!schema.customId && schema.customId !== "optional");

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

        if (mustSetCustomId && !customId) {
            console.error("Missing custom Id");
            setCustomIdError(true);
            formikActions.setSubmitting(false);
            return;
        }

        setSavingError(undefined);
        setCustomIdError(false);

        let savedEntityId: string | undefined;
        if (status === "existing") {
            if (!entity?.id) throw Error("Form misconfiguration when saving, no id for existing entity");
            savedEntityId = entity.id;
        } else if (status === "new" || status === "copy") {
            if (schema.customId) {
                if (schema.customId !== "optional" && !customId) {
                    throw Error("Form misconfiguration when saving, customId should be set");
                }
                savedEntityId = customId;
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

    }, [status, path, schema, entity, onEntitySave, mustSetCustomId, customId]);


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
            {(props) =>
                <FormInternal
                    {...props}
                    baseDataSourceValues={baseDataSourceValues}
                    onModified={onModified}
                    setInternalValue={setInternalValue}
                    onValuesChanged={onValuesChanged}
                    underlyingChanges={underlyingChanges}
                    entityId={entityId}
                    entity={entity}
                    schema={schema}
                    formRef={formRef}
                    status={status}
                    setCustomId={setCustomId}
                    customIdError={customIdError}
                    savingError={savingError}/>}
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
                             entity,
                             touched,
                             setFieldValue,
                             schema,
                             entityId,
                             isSubmitting,
                             formRef,
                             status,
                             setCustomId,
                             customIdError,
                             handleSubmit,
                             savingError
                         }: FormikProps<M> & {
    baseDataSourceValues: Partial<M>,
    onModified: ((modified: boolean) => void) | undefined,
    setInternalValue: any,
    onValuesChanged?: (changedValues?: EntityValues<M>) => void,
    underlyingChanges: Partial<M>,
    entity: Entity<M> | undefined,
    schema: ResolvedEntitySchema<M>,
    entityId: string | undefined,
    formRef: any,
    status: "new" | "existing" | "copy",
    setCustomId: (id:string) => void,
    customIdError: boolean,
    savingError?: Error
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
        values
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
                        name: key,
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

    return (
        <Container maxWidth={"sm"}
                   sx={(theme) => ({
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
                               })}
                   ref={formRef}>

            <CustomIdField schema={schema as EntitySchema}
                           status={status}
                           onChange={setCustomId}
                           error={customIdError}
                           entity={entity}/>

                <Box
                    sx={{
                        marginTop: 1
                    }}>
                    <Form onSubmit={handleSubmit}
                          noValidate>

                        <Box pt={3}>
                            {formFields}
                        </Box>

                        <Box sx={(theme) => ({
                            marginTop: theme.spacing(2),
                            background: theme.palette.mode === "light" ? "rgba(255,255,255,0.6)" : "rgba(255, 255, 255, 0)",
                            backdropFilter: "blur(4px)",
                            borderTop: `1px solid ${theme.palette.divider}`,
                            position: "sticky",
                            bottom: 0,
                            zIndex: 200
                        })}
                        >

                            {savingError &&
                            <Box textAlign="right">
                                <Typography color={"error"}>
                                    {savingError.message}
                                </Typography>
                            </Box>}

                            {buildButtons(isSubmitting, modified, status)}

                        </Box>

                    </Form>
                </Box>

            <ErrorFocus containerRef={formRef}/>

        </Container>
    );
}

function buildButtons(isSubmitting: boolean, modified: boolean, status: EntityStatus) {
    const disabled = isSubmitting || (!modified && status === "existing");
    return (
        <Box textAlign="right">

            {status === "existing" &&
            <Button
                variant="text"
                color="primary"
                disabled={disabled}
                type="reset"
                sx={{
                    margin: 1
                }}
            >
                Discard
            </Button>}

            <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={disabled}
                sx={{
                    margin: 1
                }}
            >
                {status === "existing" && "Save"}
                {status === "copy" && "Create copy"}
                {status === "new" && "Create"}
            </Button>

        </Box>
    );
}

export default EntityForm;
