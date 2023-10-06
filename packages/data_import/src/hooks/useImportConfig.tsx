import { useCallback, useState } from "react";
import { DataType, Entity, getPropertyInPath, Properties, Property } from "firecms";
import { DataTypeMapping, ImportConfig } from "../types";

export const useImportConfig = (): ImportConfig => {

    const [inUse, setInUse] = useState<boolean>(false);
    const [idColumn, setIdColumn] = useState<string | undefined>();
    const [importData, setImportData] = useState<object[]>([]);
    const [entities, setEntities] = useState<Entity<any>[]>([]);
    const [headersMapping, setHeadersMapping] = useState<Record<string, string>>({});
    const [inferredProperties, setInferredProperties] = useState<Record<string, Property>>({});

    const getPropertiesMapping = useCallback((newProperties: Record<string, Property>) => {

        function updateMapping(properties: Record<string, Property>, namespace?: string): Record<string, DataTypeMapping> {

            const dataMapping: Record<string, DataTypeMapping> = {};

            Object.keys(properties).forEach((key) => {

                const currentKey = namespace ? `${namespace}.${key}` : key;

                const property = getPropertyInPath(properties, key) as Property;
                const inferredProperty = getPropertyInPath(inferredProperties, currentKey) as Property;

                if (property) {
                    if (property.dataType === "map" && property.properties) {
                        const nestedMapping = updateMapping(property.properties as Properties, currentKey);
                        Object.keys(nestedMapping).forEach((nestedKey) => {
                            dataMapping[`${currentKey}.${nestedKey}`] = nestedMapping[nestedKey];
                        });
                        return;
                    }

                    if (inferredProperty) {

                        const from = inferredProperty.dataType;
                        const to = property.dataType;
                        let fromSubtype: DataType | undefined;
                        let toSubtype: DataType | undefined;

                        if (property.dataType === "array" && property.of) {
                            toSubtype = (property.of as Property).dataType;
                        }

                        if (inferredProperty?.dataType === "array" && inferredProperty?.of) {
                            fromSubtype = (inferredProperty.of as Property).dataType;
                        }

                        if (from !== to || fromSubtype !== toSubtype) {
                            console.log(`Mapping`, { currentKey, inferredProperty, property, from, to, fromSubtype, toSubtype });
                            dataMapping[key] = {
                                from,
                                to,
                                fromSubtype,
                                toSubtype
                            };
                        }
                    }

                }

            });

            return dataMapping;
        }

        return updateMapping(newProperties);
    }, [inferredProperties]);

    return {
        inUse,
        setInUse,
        idColumn,
        setIdColumn,
        entities,
        setEntities,
        importData,
        setImportData,
        headersMapping,
        setHeadersMapping,
        inferredProperties,
        setInferredProperties,
        getPropertiesMapping
    };
};
