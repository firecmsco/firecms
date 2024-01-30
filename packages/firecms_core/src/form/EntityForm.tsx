import React, { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
    CMSAnalyticsEvent,
    Entity,
    EntityAction,
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
import {
    canCreateEntity,
    canDeleteEntity,
    fullPathToCollectionSegments,
    getDefaultValuesFor,
    isHidden,
    isReadOnly,
    resolveCollection
} from "../util";
import {
    useAuthController,
    useCustomizationController,
    useDataSource,
    useFireCMSContext,
    useSideEntityController
} from "../hooks";
import { ErrorFocus } from "./components/ErrorFocus";
import { CustomIdField } from "./components/CustomIdField";
import { Alert, Button, cn, DialogActions, IconButton, Typography } from "@firecms/ui";
import { ErrorBoundary } from "../components";
import {
    copyEntityAction,
    deleteEntityAction
} from "../components/EntityCollectionTable/internal/default_entity_actions";
import { useAnalyticsController } from "../hooks/useAnalyticsController";

/**
 * @group Components
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

    onIdUpdateError?: (error: any) => void;

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
 * @group Components
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
                                                               autoSave,
                                                               onIdUpdateError
                                                           }: EntityFormProps<M>) {

    const analyticsController = useAnalyticsController();

    const customizationController = useCustomizationController();

    const context = useFireCMSContext();
    const dataSource = useDataSource();
    const plugins = customizationController.plugins;

    const initialResolvedCollection = useMemo(() => resolveCollection({
        collection: inputCollection,
        path,
        values: entity?.values,
        fields: customizationController.propertyConfigs
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

    const initialValuesRef = useRef<EntityValues<M>>(entity?.values ?? baseDataSourceValues as EntityValues<M>);
    const initialValues = initialValuesRef.current;
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

    const resolvedCollection = resolveCollection<M>({
        collection: inputCollection,
        path,
        entityId,
        values: internalValues,
        previousValues: initialValues,
        fields: customizationController.propertyConfigs
    });

    const onIdUpdate = inputCollection.callbacks?.onIdUpdate;
    useEffect(() => {
        if (onIdUpdate && internalValues && (status === "new" || status === "copy")) {
            try {
                const updatedId = onIdUpdate({
                    collection: resolvedCollection,
                    path,
                    entityId,
                    values: internalValues,
                    context
                });
                setEntityId(updatedId);
            } catch (e) {
                onIdUpdateError && onIdUpdateError(e);
                console.error(e);
            }
        }
    }, [entityId, internalValues, status]);

    const underlyingChanges: Partial<EntityValues<M>> = useMemo(() => {
        if (initialValues && status === "existing") {
            return Object.entries(resolvedCollection.properties)
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
    }, [baseDataSourceValues, resolvedCollection.properties, initialValues, status]);

    const save = (values: EntityValues<M>) => {
        return onEntitySaveRequested({
            collection: resolvedCollection,
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
            analyticsController.onAnalyticsEvent?.(eventName, { path });
            initialValuesRef.current = values;
        })
            .catch(e => {
                console.error(e);
                setSavingError(e);
            })
            .finally(() => {
                closeAfterSaveRef.current = false;
            });
    };

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
            if (inputCollection.customId) {
                if (inputCollection.customId !== "optional" && !entityId) {
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
                                                                    }) => dataSource.checkUniqueField(path, name, value, entityId),
        [dataSource, path, entityId]);

    const validationSchema = useMemo(() => entityId
            ? getYupEntitySchema(
                entityId,
                resolvedCollection.properties,
                uniqueFieldValidator)
            : undefined,
        [entityId, resolvedCollection.properties, uniqueFieldValidator]);

    const authController = useAuthController();

    const getActionsForEntity = useCallback(({ entity, customEntityActions }: { entity?: Entity<M>, customEntityActions?: EntityAction[] }): EntityAction[] => {
        const createEnabled = canCreateEntity(inputCollection, authController, fullPathToCollectionSegments(path), null);
        const deleteEnabled = entity ? canDeleteEntity(inputCollection, authController, fullPathToCollectionSegments(path), entity) : true;
        const actions: EntityAction[] = [];
        if (createEnabled)
            actions.push(copyEntityAction);
        if (deleteEnabled)
            actions.push(deleteEntityAction);
        if (customEntityActions)
            actions.push(...customEntityActions);
        return actions;
    }, [authController, inputCollection, path]);

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
                    collection: resolvedCollection,
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

                if (plugins && inputCollection) {
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

                return <div className="h-full overflow-auto">

                    {pluginActions.length > 0 && <div
                        className={cn("w-full flex justify-end items-center sticky top-0 right-0 left-0 z-10 bg-opacity-60 bg-slate-200 dark:bg-opacity-60 dark:bg-slate-800 backdrop-blur-md")}>
                        {pluginActions}
                    </div>}

                    <div className="pl-4 pr-4 pt-12 pb-16 md:pl-8">
                        <div
                            className={`w-full py-2 flex flex-col items-start mt-${4 + (pluginActions ? 8 : 0)} lg:mt-${8 + (pluginActions ? 8 : 0)} mb-8`}>

                            <Typography
                                className={"mt-4 flex-grow " + inputCollection.hideIdFromForm ? "mb-2" : "mb-0"}
                                variant={"h4"}>{inputCollection.singularName ?? inputCollection.name}
                            </Typography>
                            <Alert color={"base"} className={"w-full"} size={"small"}>
                                <code className={"text-xs select-all"}>{path}/{entityId}</code>
                            </Alert>
                        </div>

                        {!hideId &&
                            <CustomIdField customId={inputCollection.customId}
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
                            entity={entity}
                            resolvedCollection={resolvedCollection}
                            formContext={formContext}
                            status={status}
                            savingError={savingError}
                            closeAfterSaveRef={closeAfterSaveRef}
                            autoSave={autoSave}
                            entityActions={getActionsForEntity({ entity, customEntityActions: inputCollection.entityActions })}/>}

                    </div>
                </div>
            }}
        </Formik>
    );
}

function InnerForm<M extends Record<string, any>>(props: FormikProps<M> & {
    onModified: ((modified: boolean) => void) | undefined,
    onValuesChanged?: (changedValues?: EntityValues<M>) => void,
    underlyingChanges: Partial<M>,
    entity: Entity<M> | undefined,
    resolvedCollection: ResolvedEntityCollection<M>,
    formContext: FormContext<M>,
    status: "new" | "existing" | "copy",
    savingError?: Error,
    closeAfterSaveRef: MutableRefObject<boolean>,
    autoSave?: boolean,
    entityActions: EntityAction[]
}) {

    const {
        values,
        onModified,
        onValuesChanged,
        underlyingChanges,
        formContext,
        entity,
        touched,
        setFieldValue,
        resolvedCollection,
        isSubmitting,
        status,
        handleSubmit,
        savingError,
        dirty,
        closeAfterSaveRef,
        autoSave,
        entityActions
    } = props;

    const context = useFireCMSContext();
    const formActions = entityActions.filter(a => a.includeInForm === undefined || a.includeInForm);
    const sideEntityController = useSideEntityController();

    const modified = dirty;
    useEffect(() => {
        if (onModified)
            onModified(modified);
        if (onValuesChanged)
            onValuesChanged(values);
    }, [modified, values]);

    useEffect(() => {
        if (!autoSave && underlyingChanges && entity) {
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
    }, [autoSave, underlyingChanges, entity, values, touched, setFieldValue]);

    const formFields = (
        <div className={"flex flex-col gap-8"}>
            {(resolvedCollection.propertiesOrder ?? Object.keys(resolvedCollection.properties))
                .map((key) => {

                    const property = resolvedCollection.properties[key];
                    if (!property) {
                        console.warn(`Property ${key} not found in collection ${resolvedCollection.name}`);
                        return null;
                    }

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
                        includeDescription: property.description || property.longDescription,
                        underlyingValueHasChanged: underlyingValueHasChanged && !autoSave,
                        context: formContext,
                        tableMode: false,
                        partOfArray: false,
                        partOfBlock: false,
                        autoFocus: false
                    };

                    return (
                        <div id={`form_field_${key}`}
                             key={`field_${resolvedCollection.name}_${key}`}>
                            <ErrorBoundary>
                                <PropertyFieldBinding {...cmsFormFieldProps}/>
                            </ErrorBoundary>
                        </div>
                    );
                })
                .filter(Boolean)}

        </div>
    );

    const disabled = isSubmitting || (!modified && status === "existing");
    const formRef = React.useRef<HTMLDivElement>(null);

    return (

        <Form onSubmit={handleSubmit}
              noValidate>
            <div className="mt-12"
                 ref={formRef}>

                {formFields}

                <ErrorFocus containerRef={formRef}/>

            </div>

            <div className="h-14"/>

            {!autoSave && <DialogActions position={"absolute"}>

                {savingError &&
                    <div className="text-right">
                        <Typography color={"error"}>
                            {savingError.message}
                        </Typography>
                    </div>}

                {entity && formActions.length > 0 && <div className="flex-grow flex overflow-auto no-scrollbar">
                    {formActions.map(action => (
                        <IconButton
                            key={action.name}
                            color="primary"
                            onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                                event.stopPropagation();
                                if (entity)
                                    action.onClick({
                                        entity,
                                        fullPath: resolvedCollection.path,
                                        collection: resolvedCollection,
                                        context,
                                        sideEntityController
                                    });
                            }}>
                            {action.icon}
                        </IconButton>
                    ))}
                </div>}

                <Button
                    variant="text"
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
                    variant="filled"
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

            </DialogActions>}
        </Form>
    );
}
