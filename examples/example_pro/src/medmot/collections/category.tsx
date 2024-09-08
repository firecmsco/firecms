import { buildCollection, Permissions } from "@firecms/core";
import { getExtendedCountryNameFromLocale, getIso2FromLocale } from "../locales";


export function getCategorySchema(locale: string) {

    return buildCollection<any>({
        id: `content_categories`,
        path: `content/${locale}/categories`,
        group: `Content - ${getExtendedCountryNameFromLocale(locale)}`,
        name: "Categories" + " - " + getIso2FromLocale(locale).toUpperCase(),
        singularName: "Category",
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
            icon: {
                name: "Icon",
                dataType: "string",
                storage:{
                    storagePath: "icons",
                    acceptedFiles: ["image/*"],
                    storeUrl: true
                }
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

