import React, { useCallback, useEffect, useState } from "react";
import {
    EntitySchema,
    EntitySchemaResolver,
    EntitySchemaResolverProps,
    LocalEntitySchema,
    SchemaRegistry,
    UserConfigurationPersistence
} from "../../models";
import { getValueInPath, mergeDeep } from "../util/objects";
import { computeProperties } from "../utils";
import { ConfigurationPersistence } from "../../models/config_persistence";
import { mergeSchemas } from "../util/schemas";

type BuildSchemaRegistryProps<UserType> = {
    schemas?: EntitySchema[];
    configPersistence?: ConfigurationPersistence;
    userConfigPersistence?: UserConfigurationPersistence;
};

export function useBuildSchemaRegistry<UserType>({
                                                     schemas: baseSchemas = [],
                                                     configPersistence,
                                                     userConfigPersistence
                                                 }: BuildSchemaRegistryProps<UserType>): SchemaRegistry {

    const [initialised, setInitialised] = useState(false);

    const [schemas, setSchemas] = useState<EntitySchema[]>(baseSchemas);

    useEffect(() => {
        if (!configPersistence) {
            setInitialised(true);
            return;
        }

        if (!configPersistence?.schemas) {
            return;
        }

        const baseSchemasMerged = baseSchemas.map((baseSchema) => {
            const modifiedSchema = configPersistence.schemas?.find((schema) => schema.id === baseSchema.id);
            if (!modifiedSchema) {
                return baseSchema;
            } else {
                return mergeSchemas(baseSchema, modifiedSchema);
            }
        });

        const mergedIds = baseSchemasMerged.map(s => s.id);
        setSchemas([
            ...configPersistence.schemas.filter((schema) => !mergedIds.includes(schema.id)),
            ...baseSchemasMerged
        ]);
        setInitialised(true);
    }, [
        configPersistence?.schemas
    ]);

    const getUserSchemaOverride = useCallback(<M, >(path: string): LocalEntitySchema<M> | undefined => {
        if (!userConfigPersistence)
            return undefined
        return userConfigPersistence.getSchemaConfig<M>(path);
    }, [userConfigPersistence]);

    const findSchema = useCallback((schemaId: string): EntitySchema | undefined => {
        return schemas.find((s) => s.id === schemaId);
    }, [schemas]);

    const buildSchemaResolver = useCallback(<M, >
    ({
         schema,
         path
     }: { schema: EntitySchema<M>, path: string }): EntitySchemaResolver<M> =>
        ({
             entityId,
             values
         }: EntitySchemaResolverProps<M>) => {

            const schemaOverride = getUserSchemaOverride<M>(path);
            const storedProperties = getValueInPath(schemaOverride, "properties");

            const properties = computeProperties({
                propertiesOrBuilder: schema.properties,
                path,
                entityId,
                values: values ?? schema.defaultValues
            });

            return {
                ...schema,
                properties: mergeDeep(properties, storedProperties),
                originalSchema: schema
            };
        }, [getUserSchemaOverride]);

    return {
        initialised,
        schemas,
        findSchema,
        buildSchemaResolver
    };
}
