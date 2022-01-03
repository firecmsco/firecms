import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    AuthController,
    DataSource,
    EntityCollection,
    EntityCollectionResolver,
    EntitySchema,
    EntitySchemaResolver,
    EntitySchemaResolverProps,
    Locale,
    LocalEntityCollection,
    LocalEntitySchema,
    Navigation,
    NavigationBuilder,
    NavigationContext,
    ResolvedNavigation,
    SchemaOverrideHandler, SchemaRegistry,
    StorageSource,
    UserConfigurationPersistence
} from "../../models";
import {
    getCollectionByPath,
    removeInitialAndTrailingSlashes
} from "../util/navigation_utils";
import { getValueInPath, mergeDeep } from "../util/objects";
import { computeProperties, findSchema } from "../utils";
import { ConfigurationPersistence } from "../../models/config_persistence";
import { mergeSchemas } from "../util/schemas";

type BuildSchemaRegistryProps<UserType> = {
    authController: AuthController<UserType>;
    schemas?: EntitySchema[];
    schemaOverrideHandler: SchemaOverrideHandler | undefined;
    configPersistence?: ConfigurationPersistence;
    userConfigPersistence?: UserConfigurationPersistence;
};

export function useBuildSchemaRegistry<UserType>({
                                                        schemas: baseSchemas = [],
                                                        configPersistence,
                                                        userConfigPersistence
                                                    }: BuildSchemaRegistryProps<UserType>): SchemaRegistry {

    const [schemas, setSchemas] = useState<EntitySchema[]>(baseSchemas);
    const [persistenceLoading, setPersistenceLoading] = useState<boolean>(true);


    useEffect(() => {
        if (!configPersistence?.schemas)
            return;

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
            ...baseSchemasMerged,
        ]);
    }, [
        configPersistence?.schemas
    ]);

    const getUserSchemaOverride = useCallback(<M extends any>(path: string): LocalEntitySchema<M> | undefined => {
        if (!userConfigPersistence)
            return undefined
        return userConfigPersistence.getSchemaConfig<M>(path);
    }, [userConfigPersistence]);


    const buildSchemaResolver = useCallback(<M extends { [Key: string]: any } = any>
    ({
         schema,
         path
     }: { schema: EntitySchema<M>, path: string }): EntitySchemaResolver<M> =>
        ({
             entityId,
             values,
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
        loading: persistenceLoading,
        schemas,
        buildSchemaResolver,
    };
}

