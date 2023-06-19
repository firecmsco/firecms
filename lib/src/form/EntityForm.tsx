import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, useTheme } from "@mui/material";
import {
    CMSAnalyticsEvent,
    Entity,
    EntityCollection,
    EntityStatus,
    EntityValues,
    FormContext,
    PluginFormActionProps,
    PropertyFieldBindingProps,
    ResolvedEntityCollection
} from "../types";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import { PropertyFieldBinding } from "./PropertyFieldBinding";
import { CustomFieldValidator, getYupEntitySchema } from "./validation";
import equal from "react-fast-compare"
import { CustomDialogActions, getDefaultValuesFor, isHidden, isReadOnly, resolveCollection } from "../core";
import { useDataSource, useFireCMSContext } from "../hooks";
import { ErrorFocus } from "./components/ErrorFocus";
import { CustomIdField } from "./components/CustomIdField";
import Text from "../components/Text";

/**
 * @category Components
 */
export interface EntityFormProps<M extends Record<string, any>> {

    /**
     * New or existing status
     */
    status: EntityStatus;

    /**
     * Path of the collection this entity is located
     */
    path: string;

    /**
     * The collection is used to build the fields of the form
     */
    collection: EntityCollection<M>

    /**
     * The updated entity is passed from the parent component when the underlying data
     * has changed in the datasource
     */
    entity?: Entity<M>;

    /**
     * The callback function called when Save is clicked and validation is correct
     */
    onEntitySaveRequested: (
        props: EntityFormSaveParams<M>
    ) => Promise<void>;

    /**
     * The callback function called when discard is clicked
     */
    onDiscard?: () => void;

    /**
     * The callback function when the form is dirty, so the values are different
     * from the original ones
     */
    onModified?: (dirty: boolean) => void;

    /**
     * The callback function when the form original values have been modified
     */
    onValuesChanged?: (values?: EntityValues<M>) => void;

    /**
     *
     * @param id
     */
    onIdChange?: (id: string) => void;

    currentEntityId?: string;

    onFormContextChange?: (formContext: FormContext<M>) => void;

    hideId?: boolean;

    autoSave?: boolean;

}

export type EntityFormSaveParams<M extends Record<string, any>> = {
    collection: ResolvedEntityCollection<M>,
    path: string,
    entityId: string | undefined,
    values: EntityValues<M>,
    previousValues?: EntityValues<M>,
    closeAfterSave: boolean,
    autoSave: boolean
};

/**
 * This is the form used internally by the CMS
 * @param status
 * @param path
 * @param collection
 * @param entity
 * @param onEntitySave
 * @param onDiscard
 * @param onModified
 * @param onValuesChanged
 * @constructor
 * @category Components
 */
export const EntityForm = React.memo<EntityFormProps<any>>(EntityFormInternal,
    (a: EntityFormProps<any>, b: EntityFormProps<any>) => {
        return a.status === b.status &&
            a.path === b.path &&
            equal(a.entity?.values, b.entity?.values);
    }) as typeof EntityFormInternal;

function EntityFormInternal<M extends Record<string, any>>({
                                                               status,
                                                               path,
                                                               collection: inputCollection,
                                                               entity,
                                                               onEntitySaveRequested,
                                                               onDiscard,
                                                               onModified,
                                                               onValuesChanged,
                                                               onIdChange,
                                                               onFormContextChange,
                                                               hideId,
                                                               autoSave
                                                           }: EntityFormProps<M>) {
    const context = useFireCMSContext();
    const dataSource = useDataSource();
    const plugins = context.plugins;

    const theme = useTheme();

    const initialResolvedCollection = useMemo(() => resolveCollection({
        collection: inputCollection,
        path,
        values: entity?.values,
        fields: context.fields
    }), [entity?.values, path]);

    const mustSetCustomId: boolean = (status === "new" || status === "copy") &&
        (Boolean(initialResolvedCollection.customId) && initialResolvedCollection.customId !== "optional");

    const initialEntityId = useMemo(() => {
        if (status === "new" || status === "copy") {
            if (mustSetCustomId) {
                return undefined;
            } else {
                return dataSource.generateEntityId(path);
            }
        } else {
            return entity?.id;
        }
    }, []);

    const closeAfterSaveRef = useRef(false);

    const baseDataSourceValues: Partial<EntityValues<M>> = useMemo(() => {
        const properties = initialResolvedCollection.properties;
        if ((status === "existing" || status === "copy") && entity) {
            return entity.values ?? getDefaultValuesFor(properties);
        } else if (status === "new") {
            return getDefaultValuesFor(properties);
        } else {
            console.error({
                status,
                entity
            });
            throw new Error("Form has not been initialised with the correct parameters");
        }
    }, [status, initialResolvedCollection, entity]);

    const [entityId, setEntityId] = React.useState<string | undefined>(initialEntityId);
    const [entityIdError, setEntityIdError] = React.useState<boolean>(false);
    const [savingError, setSavingError] = React.useState<Error | undefined>();

    const [initialValues, setInitialValues] = useState<EntityValues<M>>(entity?.values ?? baseDataSourceValues as EntityValues<M>);
    const [internalValues, setInternalValues] = useState<EntityValues<M> | undefined>(initialValues);

    const doOnValuesChanges = (values?: EntityValues<M>) => {
        setInternalValues(values);
        if (onValuesChanged)
            onValuesChanged(values);
        if (autoSave && values && !equal(values, initialValues)) {
            save(values);
        }
    };

    useEffect(() => {
        if (entityId && onIdChange)
            onIdChange(entityId);
    }, [entityId, onIdChange]);

    const collection = useMemo(() => resolveCollection<M>({
        collection: inputCollection,
        path,
        entityId,
        values: internalValues,
        previousValues: initialValues,
        fields: context.fields
    }), [inputCollection, path, entityId, internalValues, initialValues]);

    const onIdUpdate = collection.callbacks?.onIdUpdate;
    useEffect(() => {
        if (onIdUpdate && internalValues && (status === "new" || status === "copy")) {
            try {
                setEntityId(
                    onIdUpdate({
                        collection,
                        path,
                        entityId,
                        values: internalValues,
                        context
                    })
                );
            } catch (e) {
                console.error(e);
            }
        }
    }, [collection, context, entityId, internalValues, path, status]);

    const underlyingChanges: Partial<EntityValues<M>> = useMemo(() => {
        if (initialValues && status === "existing") {
            return Object.entries(collection.properties)
                .map(([key, property]) => {
                    if (isHidden(property)) {
                        return {};
                    }
                    const initialValue = initialValues[key];
                    const latestValue = baseDataSourceValues[key];
                    if (!equal(initialValue, latestValue)) {
                        return { [key]: latestValue };
                    }
                    return {};
                })
                .reduce((a, b) => ({ ...a, ...b }), {}) as Partial<EntityValues<M>>;
        } else {
            return {};
        }
    }, [baseDataSourceValues, collection.properties, initialValues, status]);

    const save = (values: EntityValues<M>) =>
        onEntitySaveRequested({
            collection,
            path,
            entityId,
            values,
            previousValues: entity?.values,
            closeAfterSave: closeAfterSaveRef.current,
            autoSave: autoSave ?? false
        }).then(_ => {
            const eventName: CMSAnalyticsEvent = status === "new"
                ? "new_entity_saved"
                : (status === "copy" ? "entity_copied" : (status === "existing" ? "entity_edited" : "unmapped_event"));
            context.onAnalyticsEvent?.(eventName, { path });
            setInitialValues(values);
        })
            .catch(e => {
                console.error(e);
                setSavingError(e);
            })
            .finally(() => {
                closeAfterSaveRef.current = false;
            });

    const saveFormValues = (values: EntityValues<M>, formikActions: FormikHelpers<EntityValues<M>>) => {

        if (mustSetCustomId && !entityId) {
            console.error("Missing custom Id");
            setEntityIdError(true);
            formikActions.setSubmitting(false);
            return;
        }

        setSavingError(undefined);
        setEntityIdError(false);

        if (status === "existing") {
            if (!entity?.id) throw Error("Form misconfiguration when saving, no id for existing entity");
        } else if (status === "new" || status === "copy") {
            if (collection.customId) {
                if (collection.customId !== "optional" && !entityId) {
                    throw Error("Form misconfiguration when saving, entityId should be set");
                }
            }
        } else {
            throw Error("New FormType added, check EntityForm");
        }

        save(values)
            ?.then(_ => {
                formikActions.resetForm({
                    values,
                    submitCount: 0,
                    touched: {}
                });
            })
            .finally(() => {
                formikActions.setSubmitting(false);
            });

    };

    const uniqueFieldValidator: CustomFieldValidator = useCallback(({
                                                                        name,
                                                                        value,
                                                                        property
                                                                    }) => dataSource.checkUniqueField(path, name, value, property, entityId),
        [dataSource, path, entityId]);

    const validationSchema = useMemo(() => entityId
            ? getYupEntitySchema(
                entityId,
                collection.properties,
                uniqueFieldValidator)
            : undefined,
        [entityId, collection.properties]);

    return (
        <Formik
            initialValues={baseDataSourceValues as M}
            onSubmit={saveFormValues}
            validationSchema={validationSchema}
            validate={(values) => console.debug("Validating", values)}
            onReset={() => onDiscard && onDiscard()}
        >
            {(props) => {

                const pluginActions: React.ReactNode[] = [];

                const formContext: FormContext<M> = {
                    setFieldValue: props.setFieldValue,
                    values: props.values,
                    collection: resolveCollection({
                        collection,
                        path,
                        fields: context.fields
                    }),
                    entityId,
                    path,
                    save
                };

                // eslint-disable-next-line react-hooks/rules-of-hooks
                useEffect(() => {
                    if (onFormContextChange) {
                        onFormContextChange(formContext);
                    }
                }, [onFormContextChange, formContext]);

                if (plugins && collection) {
                    const actionProps: PluginFormActionProps = {
                        entityId,
                        path,
                        status,
                        collection: inputCollection,
                        context,
                        currentEntityId: entityId,
                        formContext
                    };
                    pluginActions.push(...plugins.map((plugin, i) => (
                        plugin.form?.Actions
                            ? <plugin.form.Actions
                                key={`actions_${plugin.name}`} {...actionProps}/>
                            : null
                    )).filter(Boolean));
                }

                return <>

                    <div
                        className="pl-4 pr-4 pt-12 pb-16 md:pl-8 md:pr-8"
                    >

                        {pluginActions.length > 0 && <div
                            className={"w-full flex justify-end row items-center absolute top-0 right-0 left-0 text-right z-2 bg-opacity-60 bg-white dark:bg-opacity-10 dark:bg-gray-800 backdrop-blur-md border-b border-gray-100 dark:border-gray-800"}>
                            {pluginActions}
                        </div>}

                        <div
                            className={`w-full py-2 flex items-center mt-${4 + (pluginActions ? 8 : 0)} lg:mt-${8 + (pluginActions ? 8 : 0)} mb-8`}>

                            <Text
                                className={"mt-4 flex-grow " + collection.hideIdFromForm ? "mb-2" : "mb-0"}
                                variant={"h4"}>{collection.singularName ?? collection.name}
                            </Text>
                        </div>

                        {!hideId &&
                            <CustomIdField customId={collection.customId}
                                           entityId={entityId}
                                           status={status}
                                           onChange={setEntityId}
                                           error={entityIdError}
                                           entity={entity}/>}

                        {entityId && <InnerForm
                            {...props}
                            initialValues={initialValues}
                            onModified={onModified}
                            onValuesChanged={doOnValuesChanges}
                            underlyingChanges={underlyingChanges}
                            path={path}
                            entity={entity}
                            entityId={entityId}
                            collection={collection}
                            formContext={formContext}
                            status={status}
                            savingError={savingError}
                            closeAfterSaveRef={closeAfterSaveRef}
                            autoSave={autoSave}/>}

                    </div>
                </>
            }}
        </Formik>
    );
}

function InnerForm<M extends Record<string, any>>(props: FormikProps<M> & {
    initialValues: Partial<M>,
    onModified: ((modified: boolean) => void) | undefined,
    onValuesChanged?: (changedValues?: EntityValues<M>) => void,
    underlyingChanges: Partial<M>,
    path: string
    entity: Entity<M> | undefined,
    collection: EntityCollection<M>,
    entityId: string,
    formContext: FormContext<M>,
    status: "new" | "existing" | "copy",
    savingError?: Error,
    closeAfterSaveRef: MutableRefObject<boolean>,
    autoSave?: boolean
}) {

    const {
        initialValues,
        values,
        onModified,
        onValuesChanged,
        underlyingChanges,
        entityId,
        formContext,
        entity,
        touched,
        setFieldValue,
        collection,
        path,
        isSubmitting,
        status,
        handleSubmit,
        savingError,
        dirty,
        errors,
        closeAfterSaveRef,
        autoSave,
        submitForm
    } = props;

    const modified = dirty;
    useEffect(() => {
        if (onModified)
            onModified(modified);
        if (onValuesChanged)
            onValuesChanged(values);
    }, [modified, values]);

    useEffect(() => {
        if (underlyingChanges && entity) {
            // we update the form fields from the Firestore data
            // if they were not touched
            Object.entries(underlyingChanges).forEach(([key, value]) => {
                const formValue = values[key];
                if (!equal(value, formValue) && !touched[key]) {
                    console.debug("Updated value from the datasource:", key, value);
                    setFieldValue(key, value !== undefined ? value : null);
                }
            });
        }
    }, [underlyingChanges, entity, values, touched, setFieldValue]);

    const formFields = (
        <div className={"flex flex-col gap-8"}>
            {Object.entries(collection.properties)
                .map(([key, property]) => {

                    const underlyingValueHasChanged: boolean =
                        !!underlyingChanges &&
                        Object.keys(underlyingChanges).includes(key) &&
                        !!touched[key];

                    const disabled = (!autoSave && isSubmitting) || isReadOnly(property) || Boolean(property.disabled);
                    const hidden = isHidden(property);
                    if (hidden) return null;
                    const cmsFormFieldProps: PropertyFieldBindingProps<any, M> = {
                        propertyKey: key,
                        disabled,
                        property,
                        includeDescription: true,
                        underlyingValueHasChanged: underlyingValueHasChanged && !autoSave,
                        context: formContext,
                        tableMode: false,
                        partOfArray: false,
                        autoFocus: false
                    };

                    return (
                        <div id={`form_field_${key}`}
                             key={`field_${collection.name}_${key}`}>
                            <PropertyFieldBinding {...cmsFormFieldProps}/>
                        </div>
                    );
                })
                .filter(Boolean)}

        </div>
    );

    const disabled = isSubmitting || (!modified && status === "existing");
    const formRef = React.createRef<HTMLDivElement>();

    return (

        <Form onSubmit={handleSubmit}
              noValidate>
            <div className="mt-4"
                 ref={formRef}>

                {formFields}

                <ErrorFocus containerRef={formRef}/>

            </div>

            <div className="h-14"/>

            {!autoSave && <CustomDialogActions position={"absolute"}>

                {savingError &&
                    <div className="text-right">
                        <Text color={"error"}>
                            {savingError.message}
                        </Text>
                    </div>}

                <Button
                    variant="text"
                    color="primary"
                    disabled={disabled}
                    type="reset"
                >
                    {status === "existing" ? "Discard" : "Clear"}
                </Button>

                <Button
                    variant="text"
                    color="primary"
                    type="submit"
                    disabled={disabled}
                    onClick={() => {
                        closeAfterSaveRef.current = false;
                    }}
                >
                    {status === "existing" && "Save"}
                    {status === "copy" && "Create copy"}
                    {status === "new" && "Create"}
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={disabled}
                    onClick={() => {
                        closeAfterSaveRef.current = true;
                    }}
                >
                    {status === "existing" && "Save and close"}
                    {status === "copy" && "Create copy and close"}
                    {status === "new" && "Create and close"}
                </Button>

            </CustomDialogActions>}
        </Form>
    );
}
