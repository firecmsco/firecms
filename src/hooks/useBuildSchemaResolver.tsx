import {
    EntitySchema,
    EntitySchemaResolver,
    EntitySchemaResolverProps
} from "../models";
import { useCallback, useMemo } from "react";
import { computeProperties } from "../core/utils";

export function buildSchemaResolver<M>({
                                           schema,
                                           path
                                       }: { schema: EntitySchema<M>, path: string }): EntitySchemaResolver {
    return ({
                entityId,
                values,
            }: EntitySchemaResolverProps) => {

        const properties = computeProperties({
            propertiesOrBuilder: schema.properties,
            path,
            entityId,
            values: values ?? schema.defaultValues
        });

        return { ...schema, properties };
    };
}

export function useBuildSchemaResolver<M>(props: { schema: EntitySchema<M>, path: string }): EntitySchemaResolver {
    return useCallback(buildSchemaResolver(props), [props]);
}
