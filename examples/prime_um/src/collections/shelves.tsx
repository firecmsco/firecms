import { buildCollection, buildProperties, buildProperty } from "@firecms/core";
import { ShareOfShelfQueryResult, ShareOfShelfZone, Shelf } from "../types";
import { ShareOfShelfView } from "../components/ShareOfShelfView";

export const shelfCollection = buildCollection<Shelf>({
    name: "Shelves",
    singularName: "Shelf",
    id: "shelves",
    path: "shelves",
    group: "Data",
    icon: "LocalGroceryStore",
    permissions: ({ authController, user }) => ({
        read: true,
        edit: true,
        create: true,
        delete: true
    }),
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        keywords: {
            name: "Keywords",
            validation: { required: true },
            dataType: "array",
            of: { dataType: "string" }
        },
        created_on: {
            name: "Created on",
            dataType: "date",
            autoValue: "on_create"
        },
        amazon_domain: {
            name: "Amazon Domain",
            dataType: "string",
            validation: { required: true },
            enumValues: [
                { id: "amazon.com", label: "Amazon.com" },
                { id: "amazon.co.uk", label: "Amazon.co.uk" },
                { id: "amazon.de", label: "Amazon.de" },
                { id: "amazon.fr", label: "Amazon.fr" },
                { id: "amazon.it", label: "Amazon.it" },
                { id: "amazon.es", label: "Amazon.es" }
            ],
        }
    }
});

const productsProperty = buildProperty({
    name: "Products",
    validation: { required: true },
    dataType: "array",
    expanded: false,
    of: {
        dataType: "map",
        properties: {
            asin: {
                name: "ASIN",
                validation: { required: true },
                dataType: "string",
                previewAsTag: true
            },
            name: {
                name: "Name",
                dataType: "string"
            },
        }
    }
});

const shareOfShelfZoneProperties = buildProperties<ShareOfShelfZone>({
    shareOfShelf: {
        name: "Share Of Shelf",
        dataType: "number"
    },
    products: productsProperty,
    client_asins: {
        name: "Client ASINs",
        dataType: "array",
        expanded: false,
        of: { dataType: "string", previewAsTag: true }
    }
});

export const shareOfShelfCollection = buildCollection<ShareOfShelfQueryResult>({
    name: "Share of Shelf queries",
    singularName: "Share of Shelf query",
    id: "share_of_shelf_queries",
    path: "share_of_shelf_queries",
    group: "Data",
    icon: "shelves",
    inlineEditing: false,
    initialSort: ["created_on", "desc"],
    permissions: ({ authController, user }) => ({
        read: true,
        edit: true,
        create: false,
        delete: true
    }),
    entityViews: [
        {
            key: "share_of_shelf_view",
            name: "Data",
            Builder: ({ entity }) => entity?.values ? <ShareOfShelfView result={entity.values}/> : null
        }
    ],
    properties: {
        client: {
            name: "Client",
            validation: { required: true },
            dataType: "reference",
            path: "clients"
        },
        client_set: ({ values }) => ({
            name: "Client Set",
            validation: { required: true },
            dataType: "reference",
            previewProperties: ["name"],
            path: `clients/${values.client}/client_sets`
        }),
        shelf: ({ values }) => ({
            name: "Shelf",
            validation: { required: true },
            dataType: "reference",
            previewProperties: ["name", "keywords"],
            path: `clients/${values.client}/shelves`
        }),
        keywords: {
            name: "Keywords",
            validation: { required: true },
            dataType: "array",
            of: { dataType: "string" }
        },
        updated_on: {
            name: "Updated on",
            dataType: "date",
            autoValue: "on_update"
        },
        created_on: {
            name: "Date",
            dataType: "date",
            autoValue: "on_create"
        },
        client_asins: {
            name: "Client ASINs",
            validation: { required: true },
            dataType: "array",
            expanded: false,
            of: { dataType: "string", previewAsTag: true }
        },
        zones: {
            name: "Zones",
            validation: { required: true },
            dataType: "map",
            spreadChildren: true,
            properties: {
                "A": {
                    dataType: "map",
                    properties: shareOfShelfZoneProperties
                },
                "B": {
                    dataType: "map",
                    properties: shareOfShelfZoneProperties
                },
                "C": {
                    dataType: "map",
                    properties: shareOfShelfZoneProperties
                },
            }
        },
        amazon_domain: {
            name: "Amazon Domain",
            dataType: "string",
            validation: { required: true },
            enumValues: [
                { id: "amazon.com", label: "Amazon.com" },
                { id: "amazon.co.uk", label: "Amazon.co.uk" },
                { id: "amazon.de", label: "Amazon.de" },
                { id: "amazon.fr", label: "Amazon.fr" },
                { id: "amazon.it", label: "Amazon.it" },
                { id: "amazon.es", label: "Amazon.es" }
            ],
        },
        products: productsProperty,
    }
});
