import { buildCollection, buildEnum } from "@firecms/core";
import { Locale } from "@/app/common/types";

const locales = buildEnum({
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "de-DE": "German"
});

export const localeCollection = buildCollection<Locale>({
    slug: "locales",
    dbPath: "locales",
    customId: locales,
    name: "Locales",
    singularName: "Locales",
    properties: {
        name: {
            name: "Title",
            validation: { required: true },
            type: "string"
        },
        description: {
            name: "Description",
            type: "string",
            markdown: true
        }
    }
});
