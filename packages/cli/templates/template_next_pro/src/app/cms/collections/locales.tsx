import { buildCollection, buildEnumValues } from "@firecms/core";
import { Locale } from "@/app/common/types";

const locales = buildEnumValues({
    "en-US": "English (United States)",
    "es-ES": "Spanish (Spain)",
    "de-DE": "German"
});

export const localeCollection = buildCollection<Locale>({
    id: "locale",
    path: "locale",
    customId: locales,
    name: "Locales",
    singularName: "Locales",
    properties: {
        name: {
            name: "Title",
            validation: { required: true },
            dataType: "string"
        },
        description: {
            name: "Description",
            dataType: "string",
            markdown: true
        }
    }
});
