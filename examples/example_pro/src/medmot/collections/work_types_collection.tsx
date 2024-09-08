import { locales } from "./locales";
import {
    ExportMappingFunction,
    AdditionalFieldDelegate,
    Permissions,
    buildCollection, buildAdditionalFieldDelegate, AsyncPreviewComponent
} from "@firecms/core";
import { collection, doc, getDoc, getFirestore } from "firebase/firestore";

export function buildLocaleColumn(locale: string, name: string) {
    return buildAdditionalFieldDelegate({
        key: `${locale}_title`,
        name: `${name} name`,
        Builder({ entity, context }) {
            return <AsyncPreviewComponent
                builder={getDoc(
                    doc(collection(getFirestore(), entity.path, entity.id, "locales"), locale))
                    .then((snapshot: any) => snapshot.get("name") as string)}
            />;
        }
    });
}

export function buildWorkTypesCollection() {

    const additionalColumns: AdditionalFieldDelegate[] = Object.entries(locales).map(([locale, name]) => buildLocaleColumn(locale, name as string));

    const sampleAdditionalExportColumn: ExportMappingFunction = {
        key: "german_name",
        builder: async ({ entity }) => {
            return getDoc(doc(collection(getFirestore(), entity.path, entity.id, "locales"), "de-DE"))
                .then((snapshot: any) => snapshot.get("name") as string);
        }
    };


    return buildCollection({
        id: "work_types",
        path: "work_types",
        name: "Work types",
        singularName: "Work type",
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
        exportable: {
            additionalFields: [sampleAdditionalExportColumn]
        },
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
