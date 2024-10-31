import {
    AdditionalFieldDelegate,
    AsyncPreviewComponent,
    buildAdditionalFieldDelegate,
    buildCollection,
    EnumValues, ExportMappingFunction,
    Permissions
} from "@firecms/core";
import { locales } from "./locales";
import { collection, doc, getDoc, getFirestore } from "firebase/firestore";

const countries: EnumValues = {
    de: "Germany",
    ch: "Switzerland",
    at: "Austria",
    es: "Spain",
    it: "Italy",
    uk: "United Kingdom",
    us: "United States",
    fr: "France",
    nl: "Netherlands",
    be: "Belgium",
};


export function buildInsurancesCollection() {

    const germanTitleColumn: AdditionalFieldDelegate = buildAdditionalFieldDelegate({
        key: "german_title",
        name: "German name",
        Builder({ entity, context }) {

            return <AsyncPreviewComponent
                builder={
                    getDoc(
                        doc(collection(getFirestore(), entity.path, entity.id, "locales"), "de-DE")
                    )
                        .then((snapshot: any) => snapshot.get("name") as string)
                }
            />;
        }
    });

    const germanDurationColumn: AdditionalFieldDelegate = buildAdditionalFieldDelegate({
        key: "german_duration",
        name: "German Duration",
        Builder({ entity, context }) {

            return <AsyncPreviewComponent
                builder={
                    getDoc(
                        doc(collection(getFirestore(), entity.path, entity.id, "locales"), "de-DE")
                    )
                        .then((snapshot: any) => snapshot.get("default_duration") as string)
                }
            />;
        }
    });

    const germanLandingColumn: AdditionalFieldDelegate = buildAdditionalFieldDelegate({
        key: "german_landing",
        name: "German Landing Page",
        Builder({ entity, context }) {

            return <AsyncPreviewComponent
                builder={
                    getDoc(
                        doc(collection(getFirestore(), entity.path, entity.id, "locales"), "de-DE")
                    )
                        .then((snapshot: any) => snapshot.get("default_landing_page") as string)
                }
            />;
        }
    });

    const sampleAdditionalExportColumn: ExportMappingFunction = {
        key: "german_name",
        builder: async ({ entity }) => {
            return getDoc(doc(collection(getFirestore(), entity.path, entity.id, "locales"), "de-DE"))
                .then((snapshot: any) => snapshot.get("name") as string);
        }
    };

    const insuranceDurationExportColumn: ExportMappingFunction = {
        key: "german_duration",
        builder: async ({ entity }) => {
            return getDoc(doc(collection(getFirestore(), entity.path, entity.id, "locales"), "de-DE"))
                .then((snapshot: any) => snapshot.get("default_duration") as string);
        }
    };

    const insuranceLandingPageExportColumn: ExportMappingFunction = {
        key: "german_duration",
        builder: async ({ entity }) => {
            return getDoc(doc(collection(getFirestore(), entity.path, entity.id, "locales"), "de-DE"))
                .then((snapshot: any) => snapshot.get("default_landing_page") as string);
        }
    };


    return buildCollection({
        id: "insurances",
        path: "insurances",
        name: "Insurances",
        singularName: "Insurance",
        customId: true,
        properties: {
            name: {
                name: "Name",
                dataType: "string",
                validation: {
                    required: true
                }
            },
            enabled: {
                name: "Enabled",
                dataType: "boolean"
            },
            country: {
                name: "Country",
                dataType: "string",
                enumValues: countries,
                validation: {
                    required: true
                }
            },
            image: {
                name: "Image",
                dataType: "string",
                description: "Image used in the App.",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            },
            default_token: {
                name: "Default Token",
                description: "A default access token for the insurers of this entity",
                dataType: "string"
            },
        }
        ,
        group: "Core",
        exportable: {
            additionalFields: [sampleAdditionalExportColumn, insuranceDurationExportColumn, insuranceLandingPageExportColumn]
        },
        textSearchEnabled: true,
        additionalFields: [germanTitleColumn, germanDurationColumn, germanLandingColumn],
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
                        validation: {
                            required: true
                        }
                    },
                    default_landing_page: {
                        name: "Landing page",
                        dataType: "string",
                        validation: {
                            required: true
                        }
                    },
                    default_duration: {
                        name: "Duration",
                        dataType: "string",
                        validation: {
                            required: true
                        }
                    }
                }

            })]
    });
}




