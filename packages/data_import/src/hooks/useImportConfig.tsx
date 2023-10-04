import { useCallback, useState } from "react";
import { DataType, Entity, getPropertyInPath, Properties, Property } from "firecms";
import { ImportConfig } from "../types";

export const useImportConfig = (): ImportConfig => {

    const [inUse, setInUse] = useState<boolean>(false);
    const [idColumn, setIdColumn] = useState<string | undefined>();
    const [importData, setImportData] = useState<object[]>([]);
    const [entities, setEntities] = useState<Entity<any>[]>([]);
    const [headersMapping, setHeadersMapping] = useState<Record<string, string>>({});
    const [inferredProperties, setInferredProperties] = useState<Record<string, Property>>({});

    const getPropertiesMapping = useCallback((newProperties: Record<string, Property>) => {

        // we need to compare the new properties with the inferred ones
        // and create a map of the different types from ones that were inferred
        // e.g. { "address.city": ["string", "reference"] }
        function updateMapping(properties: Record<string, Property>, namespace?: string): Record<string, [DataType, DataType]> {

            const dataMapping: Record<string, [DataType, DataType]> = {};

            Object.keys(properties).forEach((key) => {

                const currentKey = namespace ? `${namespace}.${key}` : key;

                const property = getPropertyInPath(properties, key) as Property;
                const inferredProperty = getPropertyInPath(inferredProperties, currentKey) as Property;

                console.log("checking key", key, property, inferredProperty)
                if (property) {
                    if (property.dataType === "map" && property.properties) {
                        const nestedMapping = updateMapping(property.properties as Properties, currentKey);
                        Object.keys(nestedMapping).forEach((nestedKey) => {
                            dataMapping[currentKey] = nestedMapping[nestedKey];
                        });
                        return;
                    }

                    if (inferredProperty && property.dataType !== inferredProperty.dataType) {
                        dataMapping[key] = [inferredProperty.dataType, property.dataType];
                    }
                }

            });

            return dataMapping;
        }

        const updateMapping1 = updateMapping(newProperties);
        console.log("updateMapping1", updateMapping1)
        return updateMapping1;
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
