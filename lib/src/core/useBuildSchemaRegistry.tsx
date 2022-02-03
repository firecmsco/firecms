import React, { useCallback, useEffect, useState } from "react";
import {
    EntitySchema,
    EntitySchemaResolver,
    EntitySchemaResolverProps,
    EnumConfig,
    LocalEntitySchema, ResolvedEntitySchema,
    SchemaRegistry,
    UserConfigurationPersistence
} from "../models";
import { getValueInPath, mergeDeep } from "./util/objects";
import { computeProperties } from "./utils";
import { ConfigurationPersistence } from "../models/config_persistence";
import { mergeSchemas } from "./util/schemas";

type BuildSchemaRegistryProps<UserType> = {
    schemas?: EntitySchema[];
    enumConfigs?: EnumConfig[];
    configPersistence?: ConfigurationPersistence;
    userConfigPersistence?: UserConfigurationPersistence;
};

export function useBuildSchemaRegistry<UserType>({
                                                     schemas: codeSchemas = [],
                                                     enumConfigs: codeEnumConfigs = [],
                                                     configPersistence,
                                                     userConfigPersistence
                                                 }: BuildSchemaRegistryProps<UserType>): SchemaRegistry {

    const [initialised, setInitialised] = useState(false);

    const [schemas, setSchemas] = useState<EntitySchema[]>(codeSchemas);
    const [enumConfigs, setEnumConfigs] = useState<EnumConfig[]>(codeEnumConfigs);

    useEffect(() => {
        if (!configPersistence) {
            setInitialised(true);
            return;
        }

        if (configPersistence.loading)
            return;

// schemas
        if (!configPersistence?.schemas) return; // still loading
        const configSchemas = configPersistence?.schemas;

        const baseSchemasMerged = codeSchemas.map((baseSchema) => {
            const modifiedSchema = configPersistence.schemas?.find((schema) => schema.id === baseSchema.id);
            if (!modifiedSchema) {
                return baseSchema;
            } else {
                return mergeSchemas(baseSchema, modifiedSchema);
            }
        });

        const mergedSchemaIds = baseSchemasMerged.map(s => s.id);

        setSchemas([
            ...configSchemas.filter((schema) => !mergedSchemaIds.includes(schema.id)),
            ...baseSchemasMerged
        ]);

// enum configs
        if (!configPersistence?.enumConfigs) return; // still loading
        const configEnums = configPersistence?.enumConfigs;
        const baseEnumsMerged: EnumConfig[] = codeEnumConfigs.map((baseEnumConfig: EnumConfig) => {
            const modifiedEnum = configPersistence.enumConfigs?.find((enumConfig) => enumConfig.id === baseEnumConfig.id);
            if (!modifiedEnum) {
                return baseEnumConfig;
            } else {
                return mergeDeep(baseEnumConfig, modifiedEnum) as EnumConfig;
            }
        });

        const mergedEnumIds = baseEnumsMerged.map(s => s.id);
        setEnumConfigs([
            ...configEnums.filter((enumConfig) => !mergedEnumIds.includes(enumConfig.id)),
            ...baseEnumsMerged
        ]);

        setInitialised(true);
    }, [
        configPersistence?.loading,
        configPersistence?.schemas,
        configPersistence?.enumConfigs
    ]);

    const getUserSchemaOverride = useCallback(<M, >(path: string): LocalEntitySchema<M> | undefined => {
        if (!userConfigPersistence)
            return undefined
        return userConfigPersistence.getSchemaConfig<M>(path);
    }, [userConfigPersistence]);

    const findSchema = useCallback((schemaId: string): EntitySchema | undefined => {
        return schemas.find((s) => s.id === schemaId);
    }, [schemas]);

    const findEnum = useCallback((id: string): EnumConfig | undefined => {
        return enumConfigs.find((s) => s.id === id);
    }, [enumConfigs]);

    const buildSchemaResolver = useCallback(<M, >
    ({
         schema,
         path
     }: { schema: EntitySchema<M> | EntitySchemaResolver<M>, path: string }): EntitySchemaResolver<M> => {

        if (typeof schema === "function")
            return schema;

        return ({
                    entityId,
                    values,
                    previousValues
                }: EntitySchemaResolverProps<M>) => {

            const schemaOverride = getUserSchemaOverride<M>(path);
            const storedProperties = getValueInPath(schemaOverride, "properties");

            const properties = computeProperties({
                propertiesOrBuilder: schema.properties,
                path,
                entityId,
                values: values ?? schema.defaultValues,
                previousValues: previousValues ?? values ?? schema.defaultValues,
                enumConfigs
            });

            return {
                ...schema,
                properties: mergeDeep(properties, storedProperties),
                originalSchema: schema
            };
        };
    }, [getUserSchemaOverride, enumConfigs]);

    return {
        initialised,
        schemas,
        enumConfigs,
        findSchema,
        findEnum,
        buildSchemaResolver
    };
}
