// import { type, getPropertyInPath, Properties, Property } from "@firecms/core";
// import { typeMapping } from "@firecms/types";
//
// export function getPropertiesMapping(originProperties: Properties,
//                                      newProperties: Properties,
//                                      headersMapping: Record<string, string | null>): Record<string, typeMapping> {
//
//     function updateMapping(properties: Record<string, Property>, namespace?: string): Record<string, typeMapping> {
//
//         const dataMapping: Record<string, typeMapping> = {};
//
//         Object.keys(properties).forEach((key) => {
//
//             const currentKey = namespace ? `${namespace}.${key}` : key;
//
//             const property = getPropertyInPath(properties, key) as Property;
//             // reverse lookup
//             const mappedKey = Object.entries(headersMapping).find(([_, value]) => value === currentKey)?.[0];
//             const inferredProperty = mappedKey ? getPropertyInPath(originProperties, mappedKey) as Property : null;
//
//             if (property) {
//                 if (property.type === "map" && property.properties) {
//                     const nestedMapping = updateMapping(property.properties as Record<string, Property>, currentKey);
//                     Object.keys(nestedMapping).forEach((nestedKey) => {
//                         dataMapping[`${currentKey}.${nestedKey}`] = nestedMapping[nestedKey];
//                     });
//                     return;
//                 }
//
//                 if (inferredProperty) {
//
//                     const from = inferredProperty.type;
//                     const to = property.type;
//                     let fromSubtype: type | undefined;
//                     let toSubtype: type | undefined;
//
//                     if (property.type === "array" && property.of) {
//                         toSubtype = (property.of as Property).type;
//                     }
//
//                     if (inferredProperty?.type === "array" && inferredProperty?.of) {
//                         fromSubtype = (inferredProperty.of as Property).type;
//                     }
//
//                     if (from !== to || fromSubtype !== toSubtype) {
//                         dataMapping[currentKey] = {
//                             from,
//                             to,
//                             fromSubtype,
//                             toSubtype
//                         };
//                     }
//                 }
//
//             }
//
//         });
//
//         return dataMapping;
//     }
//
//     return updateMapping(newProperties);
// }
