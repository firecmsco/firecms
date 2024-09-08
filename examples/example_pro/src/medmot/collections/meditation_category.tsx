import { buildCollection, Permissions } from "@firecms/core";
import { getExtendedCountryNameFromLocale, getIso2FromLocale } from "../locales";


export function getMeditationCategorySchema(locale: string) {

    return buildCollection<any>({
        id: "content_meditation_categories",
        path: `content/${locale}/meditation_categories`,
        group: `Content - ${getExtendedCountryNameFromLocale(locale)}`,
        name: "Meditation categories" + " - " + getIso2FromLocale(locale).toUpperCase(),
        singularName: "Meditation category",
        properties: {
            name: {
                name: "Name",
                validation: { required: true },
                dataType: "string"
            },
            description: {
                name: "Description",
                dataType: "string",
                multiline: true
            },
            order: {
                name: "Order",
                dataType: "number",
                validation: { required: true }
            },
            is_breathing: {
                name: "Is breathing",
                dataType: "boolean",
            },
            layout: {
                name: "Layout",
                dataType: "string",
                enumValues: {
                    grid: "Grid",
                    horizontal_list: "Horizontal List",
                    vertical_list: "Vertical List"
                }
            },
            size: {
                name: "Size",
                dataType: "string",
                enumValues: {
                    d: "default",
                    l: "Large"
                },
            },
            icon: {
                name: "Icon",
                dataType: "string",
            },
            color: {
                name: "Color",
                dataType: "string",
            },
            image: {
                name: "Image",
                dataType: "string",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            },
            visible_homepage: {
                name: "Visible in homepage",
                dataType: "boolean",
            }
        }
    });
}

