import { locales } from "./locales";
import {
    ExportMappingFunction,
    AdditionalFieldDelegate,
    Permissions,
    buildCollection, buildAdditionalFieldDelegate, AsyncPreviewComponent
} from "@firecms/core";
import { collection, doc, getDoc, getFirestore } from "firebase/firestore";
import { buildLocaleColumn } from "./work_types_collection";

export function buildSportsCollection() {

    const additionalColumns: AdditionalFieldDelegate[] = Object.entries(locales).map(([locale, name]) => buildLocaleColumn(locale, name as string));

    return buildCollection({
        id: "sports",
        path: "sports",
        name: "Sport types",
        singularName: "Sport",
        customId: true,
        properties: {
            name: {
                name: "Name",
                dataType: "string",
                columnWidth: 360,
                validation: {
                    required: true
                }
            },
            enabled: {
                name: "Enabled",
                dataType: "boolean"
            }
        },
        group: "Core",
        exportable: true,
        textSearchEnabled: true,
        additionalFields: additionalColumns,
        subcollections: [
            buildCollection({
                id: "locales",
                path: "locales",
                defaultSize: "s",
                name: "Locales",
                singularName: "Locale",
                customId: locales,
                properties: {
                    name: {
                        name: "Name",
                        dataType: "string",
                        columnWidth: 360,
                        validation: {
                            required: true
                        }
                    },
                    synonyms: {
                        name: "Synonyms",
                        dataType: "array",
                        of: {
                            dataType: "string",
                            validation: {
                                required: true
                            }
                        },
                        columnWidth: 360
                    }
                }
            })]
    });
}
