import { buildCollection, buildEnumValues } from "@rebasepro/core";

const locales = buildEnumValues({
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "de-DE": "German"
});

export const localeCollection = buildCollection({
    slug: "locale",
    dbPath: "locale",
    name: "Locales",
    singularName: "Locales",
    properties: {
        name: {
            name: "Title",
            validation: { required: true },
            type: "string"
        },
        selectable: {
            name: "Selectable",
            description: "Is this locale selectable",
            type: "boolean"
        }
    }
});
