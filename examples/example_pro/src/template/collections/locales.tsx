import { buildCollection, buildEnum } from "@firecms/core";

const locales = buildEnum({
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "de-DE": "German"
});

export const localeCollection = buildCollection({
    slug: "locale",
    dbPath: "locale",
    customId: locales,
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
