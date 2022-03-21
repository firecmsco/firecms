import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import {
    CMSFormFieldProps,
    Entity,
    EntityCollection,
    EntityStatus,
    EntityValues,
    FormContext,
    ResolvedEntityCollection
} from "../models";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import { buildPropertyField } from "./form_factory";
import { CustomFieldValidator, getYupEntitySchema } from "./validation";
import equal from "react-fast-compare"
import { getDefaultValuesFor, isReadOnly } from "../core/util/entities";
import { CustomIdField } from "./components/CustomIdField";
import { useDataSource } from "../hooks";
import { CustomDialogActions } from "../core/components/CustomDialogActions";
import { getResolvedCollection } from "../core";
import { useVirtual } from "react-virtual";

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
    onEntitySave?(
        props:
            {
                collection: ResolvedEntityCollection<M>,
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
 * @param collection
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
                                  collection: inputCollection,
                                  entity,
                                  onEntitySave,
                                  onDiscard,
                                  onModified,
                                  onValuesChanged
                              }: EntityFormProps<M>) {

    const dataSource = useDataSource();

    const initialResolvedCollection = useMemo(() => getResolvedCollection({
        collection: inputCollection,
        path,
        values: entity?.values
    }), [inputCollection, path]);

    const mustSetCustomId: boolean = (status === "new" || status === "copy") &&
        (Boolean(initialResolvedCollection.customId) && initialResolvedCollection.customId !== "optional");

    const inputEntityId = useMemo(() => {
        if ((status === "new" || status === "copy") && initialResolvedCollection.customId === "optional")
            return dataSource.generateEntityId(path);
        return mustSetCustomId ? undefined : (entity?.id ?? dataSource.generateEntityId(path));
    }, []);

    const baseDataSourceValues: Partial<EntityValues<M>> = useMemo(() => {
        const properties = initialResolvedCollection.properties;
        if ((status === "existing" || status === "copy") && entity) {
            return entity.values ?? getDefaultValuesFor(properties);
        } else if (status === "new") {
            return getDefaultValuesFor(properties);
        } else {
            console.error({ status, entity });
            throw new Error("Form has not been initialised with the correct parameters");
        }
    }, [status, initialResolvedCollection, entity]);

    const [entityId, setEntityId] = React.useState<string | undefined>(inputEntityId);
    const [entityIdError, setEntityIdError] = React.useState<boolean>(false);
    const [savingError, setSavingError] = React.useState<Error | undefined>();

    const initialValuesRef = React.useRef<EntityValues<M>>(entity?.values ?? baseDataSourceValues as EntityValues<M>);
    const initialValues = initialValuesRef.current;

    const [internalValue, setInternalValue] = useState<EntityValues<M> | undefined>(initialValues);

    const collection = useMemo(() => getResolvedCollection<M>({
        collection: inputCollection,
        path,
        entityId,
        values: internalValue,
        previousValues: initialValues
    }), [inputCollection, path, entityId, internalValue, initialValues]);

    const underlyingChanges: Partial<EntityValues<M>> = useMemo(() => {
        if (initialValues && status === "existing") {
            return Object.keys(collection.properties)
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
            if (collection.customId) {
                if (collection.customId !== "optional" && !entityId) {
                    throw Error("Form misconfiguration when saving, entityId should be set");
                }
                savedEntityId = entityId;
            }
        } else {
            throw Error("New FormType added, check EntityForm");
        }

        if (onEntitySave)
            onEntitySave({
                collection: collection,
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

    }, [status, path, collection, entity, onEntitySave, mustSetCustomId, entityId]);

    const uniqueFieldValidator: CustomFieldValidator = useCallback(({
                                                                        name,
                                                                        value,
                                                                        property
                                                                    }) => dataSource.checkUniqueField(path, name, value, property, entityId),
        [dataSource, path, entityId]);

    const validationSchema = useMemo(() => getYupEntitySchema(
        collection.properties,
        uniqueFieldValidator), [collection.properties]);

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={saveValues}
            validationSchema={validationSchema}
            validate={(values) => console.debug("Validating", values)}
            onReset={() => onDiscard && onDiscard()}
        >
            {(props) => {
                return <FormInternal
                    {...props}
                    onEntityIdModified={setEntityId}
                    baseDataSourceValues={baseDataSourceValues}
                    onModified={onModified}
                    setInternalValue={setInternalValue}
                    onValuesChanged={onValuesChanged}
                    underlyingChanges={underlyingChanges}
                    path={path}
                    entity={entity}
                    entityId={entityId}
                    collection={collection}
                    status={status}
                    entityIdError={entityIdError}
                    savingError={savingError}/>
            }
            }
        </Formik>
    );
}

function FormInternal<M>({
                             baseDataSourceValues,
                             values,
                             onModified,
                             onEntityIdModified,
                             setInternalValue,
                             onValuesChanged,
                             underlyingChanges,
                             entityId,
                             entity,
                             touched,
                             entityIdError,
                             setFieldValue,
                             collection,
                             path,
                             isSubmitting,
                             status,
                             handleSubmit,
                             savingError,
                             errors,
                             isValidating
                         }: FormikProps<M> & {
    baseDataSourceValues: Partial<M>,
    onModified: ((modified: boolean) => void) | undefined,
    onEntityIdModified: (id: string | undefined) => void,
    setInternalValue: any,
    onValuesChanged?: (changedValues?: EntityValues<M>) => void,
    underlyingChanges: Partial<M>,
    path: string
    entityIdError: boolean,
    entity: Entity<M> | undefined,
    collection: ResolvedEntityCollection<M>,
    entityId?: string,
    status: "new" | "existing" | "copy",
    savingError?: Error,
}) {

    const parentRef = React.useRef<any>();
    const scrollingRef = React.useRef<number | undefined>()

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

    const scrollToFn = React.useCallback((offset, defaultScrollTo) => {
        const duration = 1000;
        const start = parentRef.current.scrollTop;
        const startTime = (scrollingRef.current = Date.now());

        const run = () => {
            if (scrollingRef.current !== startTime) return;
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = easeInOutQuint(Math.min(elapsed / duration, 1));
            const interpolated = start + (offset - start) * progress;

            if (elapsed < duration) {
                defaultScrollTo(interpolated);
                requestAnimationFrame(run);
            } else {
                defaultScrollTo(interpolated);
            }
        }

        requestAnimationFrame(run);
    }, []);

    const context: FormContext<M> | undefined = entityId
        ? {
            collection,
            entityId,
            values,
            path
        }
        : undefined;

    const errorKeys = Object.keys(errors);
    const rowVirtualizer = useVirtual({
        paddingStart: 16,
        paddingEnd: 48,
        size: context ? Object.keys(collection.properties).length + 1 : 1,
        parentRef,
        // estimateSize: React.useCallback(i => 64, [collection.properties]),
        keyExtractor: React.useCallback((i) => {
                if (i === 0) return "id_dc4w4rdw345f";
                const propertyKey = Object.keys(collection.properties)[i - 1];
                const hasError = Boolean(errorKeys[propertyKey]);
                return `${propertyKey}_${hasError}`;
            },
            [collection.properties, errorKeys]),
        overscan: 8,
        scrollToFn,
    })

    useEffect(() => {
        const keys = errorKeys;
        // Whenever there are errors and the form is submitting but finished validating.
        if (keys.length > 0 && isSubmitting && !isValidating) {
            rowVirtualizer.scrollToIndex(Object.keys(collection.properties).indexOf(keys[0]) + 1)
        }
    }, [isSubmitting, isValidating, errorKeys]);

    const formFields = (
        <Box
            ref={parentRef}
            sx={(theme) => ({
                width: "100%",
                height: "100%",
                overflow: "auto",
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
        >

            <div
                style={{
                    height: rowVirtualizer.totalSize,
                    width: "100%",
                    position: "relative"
                }}
            >

                {rowVirtualizer.virtualItems.map((virtualRow) => {

                    if (virtualRow.index === 0) {

                        return (
                            <Box
                                key={virtualRow.index}
                                ref={virtualRow.measureRef}
                                style={{
                                    transform: `translateY(${virtualRow.start}px)`
                                }}
                                sx={{
                                    width: "100%",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    pb: 2
                                }}
                            >
                                <CustomIdField customId={collection.customId}
                                               entityId={entityId}
                                               status={status}
                                               onChange={onEntityIdModified}
                                               error={entityIdError}
                                               entity={entity}/>
                            </Box>
                        );
                    }

                    const key = Object.keys(collection.properties)[virtualRow.index - 1];
                    const property = collection.properties[key];

                    const underlyingValueHasChanged: boolean =
                        !!underlyingChanges &&
                        Object.keys(underlyingChanges).includes(key) &&
                        !!touched[key];

                    const shouldAlwaysRerender = typeof (collection.originalCollection.properties)[key] === "function";

                    const disabled = isSubmitting || isReadOnly(property) || Boolean(property.disabled);
                    const cmsFormFieldProps: CMSFormFieldProps = {
                        propertyKey: key,
                        disabled,
                        property,
                        includeDescription: true,
                        underlyingValueHasChanged,
                        context: context as FormContext<M>,
                        tableMode: false,
                        partOfArray: false,
                        autoFocus: false,
                        shouldAlwaysRerender
                    };
                    return (
                        <Box
                            key={virtualRow.index}
                            ref={virtualRow.measureRef}
                            style={{
                                transform: `translateY(${virtualRow.start}px)`
                            }}
                            sx={{
                                width: "100%",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                pb: 2
                            }}
                        >
                            {buildPropertyField(cmsFormFieldProps)}
                        </Box>
                    );
                })}
            </div>
        </Box>
    )

    const disabled = isSubmitting || (!modified && status === "existing");

    return (

        <Form onSubmit={handleSubmit}
              noValidate
              style={{
                  height: "100%",
              }}>

            {formFields}

            {/*<Box sx={{ height: 56 }}/>*/}

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

function easeInOutQuint(t: number) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
}

export default EntityForm;
