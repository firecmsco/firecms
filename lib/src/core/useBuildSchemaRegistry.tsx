import React, { useCallback, useEffect, useState } from "react";
import {
    EntitySchema,
    EntityValues,
    EnumConfig,
    LocalEntitySchema,
    Properties,
    PropertiesOrBuilder,
    PropertyOrBuilder,
    ResolvedEntitySchema,
    ResolvedProperties,
    ResolvedProperty,
    SchemaRegistry,
    UserConfigurationPersistence
} from "../models";
import { getValueInPath, mergeDeep } from "./util/objects";
import {
    buildPropertyFrom,
    computePropertyEnums,
    getDefaultValuesFor
} from "./util/entities";
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
        const allEnumConfigs = [
            ...configEnums.filter((enumConfig) => !mergedEnumIds.includes(enumConfig.id)),
            ...baseEnumsMerged
        ];
        setEnumConfigs(allEnumConfigs);

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
        const schema = schemas.find((s) => s.id === schemaId);
        if (!schema) return undefined;
        return {
            ...schema,
            propertiesOrder: schema.propertiesOrder ?? Object.keys(schema.properties)
        };
    }, [schemas]);

    const findEnum = useCallback((id: string): EnumConfig | undefined => {
        return enumConfigs.find((s) => s.id === id);
    }, [enumConfigs]);

    const resolveSchema = <M extends { [Key: string]: any } = any, >({
                                                                         path,
                                                                         schema,
                                                                         entityId,
                                                                         values,
                                                                         previousValues
                                                                     }: {
        path: string,
        schema: EntitySchema<M> | ResolvedEntitySchema<M>,
        entityId?: string,
        values?: Partial<EntityValues<M>>,
        previousValues?: Partial<EntityValues<M>>,
    }) => {
        const schemaOverride = getUserSchemaOverride<M>(path);
        const storedProperties = getValueInPath(schemaOverride, "properties");

        const defaultValues = getDefaultValuesFor(schema.properties);
        const resolvedProperties = resolveProperties<M>({
            propertiesOrBuilder: schema.properties,
            path,
            entityId,
            values: values ?? defaultValues,
            previousValues: previousValues ?? values ?? defaultValues,
            enumConfigs
        });

        const properties: Properties = mergeDeep(resolvedProperties, storedProperties);
        const cleanedProperties = Object.entries(properties)
            .filter(([_, property]) => Boolean(property.dataType))
            .map(([id, property]) => ({ [id]: property }))
            .reduce((a, b) => ({ ...a, ...b }), {});

        return {
            ...schema,
            properties: cleanedProperties,
            originalSchema: schema
        } as ResolvedEntitySchema<M>;
    };

    const getResolvedSchema = useCallback(<M extends { [Key: string]: any } = any, >
    ({
         schema: inputSchema,
         path,
         entityId,
         values,
         previousValues
     }: {
        schema: string | EntitySchema<M> | ResolvedEntitySchema<M>;
        path: string,
        entityId?: string,
        values?: Partial<EntityValues<M>>,
        previousValues?: Partial<EntityValues<M>>,
    }): ResolvedEntitySchema<M> => {

        const schema = typeof inputSchema === "string" ? findSchema(inputSchema) : inputSchema;
        if (!schema)
            throw Error("Unable to find schema with id " + inputSchema);

        const result = resolveSchema({
            path,
            schema: schema as EntitySchema<M>,
            entityId,
            values,
            previousValues
        });
        return result;

    }, [getUserSchemaOverride, schemas, enumConfigs]);

    const getResolvedProperty = useCallback(<M extends { [Key: string]: any } = any, >
    ({
         schema: inputSchema,
         path,
         entityId,
         propertyId,
         values,
         previousValues
     }: {
        schema: string | EntitySchema<M> | ResolvedEntitySchema<M>;
        path: string,
        entityId?: string,
        propertyId: string,
        values?: Partial<EntityValues<M>>,
        previousValues?: Partial<EntityValues<M>>,
    }): ResolvedProperty | null => {

        const schema = typeof inputSchema === "string" ? findSchema(inputSchema) : inputSchema;
        if (!schema)
            throw Error("Unable to find schema with id " + inputSchema);

        const propertyOrBuilder = schema.properties[propertyId];

        return resolveProperty({
            propertyOrBuilder,
            path,
            entityId,
            values,
            propertyId,
            previousValues,
            enumConfigs
        });

    }, [getUserSchemaOverride, schemas, enumConfigs]);

    return {
        initialised,
        schemas,
        enumConfigs,
        findSchema,
        findEnum,
        getResolvedSchema,
        getResolvedProperty
    };
}

function resolveProperty<M>({
                                propertyOrBuilder,
                                values,
                                previousValues,
                                path,
                                entityId,
                                propertyId,
                                enumConfigs
                            }: {
    propertyOrBuilder: PropertyOrBuilder,
    values?: Partial<M>,
    previousValues?: Partial<M>,
    path: string,
    entityId: string | undefined,
    propertyId: string,
    enumConfigs: EnumConfig[]
}): ResolvedProperty | null {
    try {
        const property = buildPropertyFrom({
            propertyOrBuilder,
            values: values ?? {},
            previousValues: previousValues ?? values ?? {},
            path,
            entityId
        });
        if (property === null) return null;
        return computePropertyEnums(
            property,
            enumConfigs);
    } catch (e) {
        console.error("Error resolving property " + propertyId);
        console.error(e);
        return null;
    }
}

/**
 *
 * @param propertiesOrBuilder
 * @param values
 * @param previousValues
 * @param path
 * @param entityId
 * @param enumConfigs
 * @ignore
 */
function resolveProperties<M extends { [Key: string]: any }>(
    {
        propertiesOrBuilder,
        path,
        entityId,
        values,
        previousValues,
        enumConfigs
    }: {
        propertiesOrBuilder: PropertiesOrBuilder<M> | ResolvedProperties<M>,
        path: string,
        entityId?: string | undefined,
        values?: Partial<EntityValues<M>>,
        previousValues?: Partial<EntityValues<M>>,
        enumConfigs: EnumConfig[]
    }): ResolvedProperties<M> {
    return Object.entries(propertiesOrBuilder)
        .map(([key, propertyOrBuilder]) => {

            return {
                [key]: resolveProperty({
                    propertyOrBuilder: propertyOrBuilder,
                    values: values,
                    previousValues: previousValues,
                    path: path,
                    entityId: entityId,
                    propertyId: key,
                    enumConfigs: enumConfigs
                })
            };
        })
        .filter((a) => a !== null)
        .reduce((a, b) => ({ ...a, ...b }), {}) as ResolvedProperties<M>;
}
