import { expect, it } from "@jest/globals";

import { EntityCollection, PropertyBuilder } from "../../src/types";
import { mergeCollection } from "../../src";

const priceBuilder: PropertyBuilder = ({ values }: any) => ({
    dataType: "number",
    name: "Price",
    validation: {
        requiredMessage: "You must set a price between 0 and 1000",
        min: 0,
        max: 1000
    },
    disabled: !values.available && {
        clearOnDisabled: true,
        disabledMessage: "You can only set the price on available items"
    },
    description: "Price with range validation"
});

export const baseProductCollection: EntityCollection = {
    id: "product",
    path: "product",
    name: "Products",
    singularName: "Product",
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            multiline: true,
            validation: { required: true }
        },
        currency: {
            dataType: "string",
            name: "Currency",
            enumValues: [
                { id: "DOL", label: "Dollars" },
            ]
        },
        price: priceBuilder
    }
};

export const persistedProductCollection: EntityCollection = {
    id: "product",
    path: "product",
    name: "Products persisted",
    singularName: "Product persisted",
    properties: {
        name: {
            dataType: "string",
            name: "Name updated",
            multiline: true,
            validation: { required: true }
        },
        currency: {
            dataType: "string",
            name: "Currency",
            enumValues: [
                { id: "EUR", label: "Euros" },
                { id: "DOL", label: "Dollars" },
            ]
        },
        publisher: {
            name: "Publisher",
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                external_id: {
                    name: "External id",
                    dataType: "string"
                },
                name: {
                    name: "Name",
                    dataType: "string"
                },
            },
            propertiesOrder: ["name", "external_id"]
        }
    },
    propertiesOrder: ["name", "publisher", "price"]
};

it("Merge collections", () => {
    const mergedCollection = mergeCollection(baseProductCollection, persistedProductCollection);

    expect(mergedCollection).toEqual(
        {
            path: "product",
            name: "Products persisted",
            singularName: "Product persisted",
            properties: {
                name: {
                    dataType: "string",
                    name: "Name updated",
                    multiline: true,
                    validation: { required: true }
                },
                currency: {
                    dataType: "string",
                    name: "Currency",
                    enumValues: [
                        { id: "EUR", label: "Euros" },
                        { id: "DOL", label: "Dollars" },
                    ]
                },
                publisher: {
                    name: "Publisher",
                    description: "This is an example of a map property",
                    dataType: "map",
                    properties: {
                        name: {
                            name: "Name",
                            dataType: "string"
                        },
                        external_id: {
                            name: "External id",
                            dataType: "string"
                        }
                    },
                    propertiesOrder: ["name", "external_id"]
                },
                price: priceBuilder,
            },
            propertiesOrder: ["name", "publisher", "price"],
            subcollections: undefined
        });
});
