import React, { PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import {
    DataEnhancementController,
    EnhancedDataResult,
    EnhanceParams,
    InputProperty
} from "../types/data_enhancement_controller";
import {
    DataSource,
    Entity,
    EntityCollection,
    getValueInPath,
    PluginFormActionProps,
    resolveCollection,
    useAuthController,
    useCustomizationController,
    useDataSource,
    useNavigationController,
    useSnackbarController
} from "@firecms/core";

import { enhanceDataAPIStream, fetchEntityPromptSuggestion } from "../api";
import { getAppendableSuggestion } from "../utils/suggestions";
import { getSimplifiedProperties } from "../utils/properties";
import { useEditorAIController } from "../editor/useEditorAIController";

export const DataEnhancementControllerContext = React.createContext<DataEnhancementController>({} as any);

export type DataEnhancementControllerProviderProps = {

    apiKey: string;

    getConfigForPath?: (props: {
        path: string,
        collection: EntityCollection
    }) => boolean;

    host?: string;
}

export const useDataEnhancementController = (): DataEnhancementController => useContext(DataEnhancementControllerContext);

function getPropertyFromKey(properties: Record<string, InputProperty>, propertyKey: string) {
    if (propertyKey in properties) {
        return properties[propertyKey];
    } else {
        //split the property key
        const split = propertyKey.split(".");
        if (split.length === 1) {
            return undefined;
        }
        const parentKey = split.slice(0, split.length - 1).join(".");
        return getPropertyFromKey(properties, parentKey);

    }
}

export function DataEnhancementControllerProvider({
                                                      apiKey,
                                                      getConfigForPath,
                                                      children,
                                                      host,
                                                      path,
                                                      collection,
                                                      formContext,
                                                  }: PropsWithChildren<DataEnhancementControllerProviderProps & PluginFormActionProps<any>>) {

    const [enabled, setEnabled] = useState(false);
    const [suggestions, setSuggestions] = useState<Record<string, string | number>>({});
    const [loadingSuggestions, setLoadingSuggestions] = useState<string[]>([]);

    const customizationController = useCustomizationController();
    const enhancingInProgress = useRef(false);

    const authController = useAuthController();
    const snackbarController = useSnackbarController();

    const resolvedCollection = resolveCollection({
        collection,
        path: path,
        entityId: formContext?.entityId,
        values: formContext?.values,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    });

    const properties = useMemo(() => getSimplifiedProperties(resolvedCollection.properties, formContext?.values), [formContext?.values]);
    // const preEnhanceValuesRef = React.useRef(formContext?.values ?? {});
    const valuesRef = React.useRef(formContext?.values ?? {});
    useEffect(() => {
        if (!enhancingInProgress.current)
            valuesRef.current = formContext?.values ?? {};
    }, [formContext?.values]);

    const allowReferenceDataSelection = false;

    const updateConfig = useCallback(async () => {
        if (!getConfigForPath) return;
        const config = getConfigForPath({
            path,
            collection
        });
        if (config) {
            setEnabled(true);
        }
    }, [collection, getConfigForPath, path]);

    useEffect(() => {
        if (!getConfigForPath) {
            setEnabled(true);
        } else {
            updateConfig();
        }

    }, [getConfigForPath, updateConfig]);

    const dataSource = useDataSource(collection);
    const navigationController = useNavigationController();

    const clearSuggestion = useCallback((propertyKey: string) => {
        setSuggestions((prev) => {
            //remove propertyKey from prev
            const {
                [propertyKey]: _,
                ...rest
            } = prev;
            return rest;
        });
    }, []);

    const appendValueDelta = (propertyKey: string, delta: string) => {

        const property = getPropertyFromKey(properties, propertyKey);
        if (delta === null || property?.disabled) {
            return;
        }

        // clearSuggestion(propertyKey);
        const value = getValueInPath(valuesRef.current, propertyKey);

        const currentValue = value ? (value as string) + "" : "";
        const updatedValue = currentValue + delta;
        // if (currentValue.length === 0) updatedValue = updatedValue.trimStart();
        valuesRef.current = {
            ...valuesRef.current,
            [propertyKey]: updatedValue
        };
        formContext?.setFieldValue(propertyKey, updatedValue, false);
        setSuggestions(prev => ({
            ...prev,
            [propertyKey]: (prev[propertyKey] ?? "") + delta
        }));
    };

    const updateSuggestedValues = (currentValues: object, updatedValues: Record<string, string | number>, replaceValues: boolean) => {

        setLoadingSuggestions((prev) => {
            return prev.filter(p => !Object.keys(updatedValues).includes(p));
        });

        Object.entries(updatedValues).forEach(([propertyKey, suggestion]) => {

            const value = getValueInPath(currentValues, propertyKey);
            const property = getPropertyFromKey(properties, propertyKey);

            if (!property || suggestion === null || property.disabled) {
                return;
            }

            if (typeof suggestion === "number") {
                formContext?.setFieldValue(propertyKey, suggestion);
                return;
            }

            if (replaceValues) {
                formContext?.setFieldValue(propertyKey, suggestion);
                return;
            }

            const appendableValue = getAppendableSuggestion(suggestion, value);

            const currentValue = value ? (value as string) + "" : "";
            if (appendableValue) {
                formContext?.setFieldValue(propertyKey, suggestion);
            } else {
                const multiline = property?.fieldConfigId === "multiline" || property?.fieldConfigId === "markdown";
                const trimmedValue = currentValue.trimEnd();
                if (multiline && (trimmedValue.endsWith(".") || trimmedValue.endsWith("?") || trimmedValue.endsWith("!") || trimmedValue.endsWith(":"))) {
                    formContext?.setFieldValue(propertyKey, trimmedValue + "\n\n" + (suggestion as string).trimStart());
                } else {
                    formContext?.setFieldValue(propertyKey, trimmedValue + (trimmedValue.length > 0 ? " " : "") + (suggestion as string));
                }
            }
        });

        setSuggestions(prev => ({
            ...prev,
            ...Object.keys(updatedValues)
                .reduce((acc, key) => {
                    const value = getValueInPath(formContext?.values, key);
                    const suggestion = updatedValues[key];
                    return {
                        ...acc,
                        [key]: getAppendableSuggestion(suggestion, value) ?? suggestion
                    };
                }, {})
        }));
    };

    function displayNeededSubscriptionSnackbar(projectId: any) {
        snackbarController.open({
            type: "warning",
            message: "A valid subscription is needed in order to use this function.",
            autoHideDuration: 4000
        })
    }

    const editorAIController = useEditorAIController({ getAuthToken: authController.getAuthToken });

    const enhance = async (props: EnhanceParams<any>): Promise<EnhancedDataResult | null> => {

        if (!authController.user) {
            snackbarController.open({
                type: "warning",
                message: "You need to be logged in to enhance data"
            });
            return Promise.reject(new Error("Not logged in"));
        }

        const resolvedPath = navigationController.resolveDatabasePathsFrom(path);
        const firebaseToken = await authController.getAuthToken();

        if (props.propertyKey) {
            clearSuggestion(props.propertyKey)
        } else {
            clearAllSuggestions();
        }

        setLoadingSuggestions((prev) => [...prev, ...(props.propertyKey ? [props.propertyKey] : Object.keys(properties))]);
        enhancingInProgress.current = true;

        const currentValues = valuesRef.current ?? {};

        return new Promise((resolve, reject) => {
            function onError(e: any) {
                setLoadingSuggestions([]);
                if (e.code === "payment-required") {
                    const projectId = e.data.projectId;
                    displayNeededSubscriptionSnackbar(projectId);
                } else {
                    console.error("Enhance error", e);
                }
                reject(e);
                enhancingInProgress.current = false;
            }

            try {
                enhanceDataAPIStream({
                    ...props,
                    host,
                    apiKey,
                    properties,
                    path: resolvedPath,
                    entityName: collection.singularName ?? collection.name,
                    entityDescription: collection.description,
                    dataSource,
                    firebaseToken,
                    onUpdate: (suggestions) => {
                        console.debug("de onUpdate", suggestions);
                        updateSuggestedValues(currentValues, suggestions, props.replaceValues ?? false);
                    },
                    onUpdateDelta: (propertyKey: string, partialValue: string) => {
                        // console.debug("de delta", propertyKey, partialValue);
                        appendValueDelta(propertyKey, partialValue);
                    },
                    onError,
                    onEnd: (result) => {
                        console.debug("de onEnd", result);
                        if (result.errors) {
                            result.errors.forEach((error) => {
                                snackbarController.open({
                                    type: "warning",
                                    message: error
                                })
                            });
                        }
                        if (Object.keys(result.suggestions).length === 0) {
                            snackbarController.open({
                                type: "info",
                                autoHideDuration: 1800,
                                message: "No fields were updated"
                            })
                        }
                        setLoadingSuggestions([]);
                        resolve(result);
                        enhancingInProgress.current = false;
                    }
                }).catch(onError);
            } catch (e: any) {
                onError(e);
            }
        })
    };

    const clearAllSuggestions = useCallback(() => {
        setSuggestions({});
    }, []);

    const getSamplePrompts = useCallback(async (entityName: string, input?: string) => {
        const firebaseToken = await authController.getAuthToken()
        return fetchEntityPromptSuggestion({
            host,
            entityName,
            firebaseToken,
            apiKey,
            input
        });
    }, [apiKey, authController.getAuthToken]);

    const dataEnhancementController: DataEnhancementController = {
        enabled,
        suggestions,
        clearSuggestion,
        enhance,
        allowReferenceDataSelection,
        clearAllSuggestions,
        getSamplePrompts,
        loadingSuggestions,
        editorAIController
    };

    return (
        <DataEnhancementControllerContext.Provider
            value={dataEnhancementController}>
            {children}
        </DataEnhancementControllerContext.Provider>
    );
}

const ENTITIES_COUNT = 1;

async function getOtherEntities(collection: EntityCollection, dataSource: DataSource, path: string, entityId: string | number): Promise<Entity<any>[]> {
    const fetchedDocs = await dataSource.fetchCollection({
        path: path,
        collection,
        filter: { __name__: [">", entityId] },
        orderBy: "__name__",
        order: "asc",
        limit: ENTITIES_COUNT
    });
    if (fetchedDocs.length < ENTITIES_COUNT) {
        fetchedDocs.push(...await dataSource.fetchCollection({
            path: path,
            collection,
            filter: { __name__: ["<", entityId] },
            orderBy: "__name__",
            order: "asc",
            limit: ENTITIES_COUNT - fetchedDocs.length
        }))
    }
    return fetchedDocs;
}
