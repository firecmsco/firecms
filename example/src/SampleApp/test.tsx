import React from "react";

import {
    buildEntityCallbacks,
    buildSchema,
    buildCollection,
    EntityOnDeleteProps,
    EntityOnSaveProps
} from "@camberi/firecms";

type Product = {
    name: string;
    uppercase_name: string;
}

const productSchema = buildSchema<Product>({

    name: "Product",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        uppercase_name: {
            title: "Uppercase Name",
            dataType: "string",
            disabled: true,
            description: "This field gets updated with a preSave callback"
        }
    }
});

const productCallbacks = buildEntityCallbacks<Product>({
    onPreSave: ({
                    schema,
                    path,
                    entityId,
                    values,
                    status
                }) => {
        values.uppercase_name = values.name?.toUpperCase();
        return values;
    },

    onSaveSuccess: (props: EntityOnSaveProps<Product>) => {
        console.log("onSaveSuccess", props);
    },

    onSaveFailure: (props: EntityOnSaveProps<Product>) => {
        console.log("onSaveFailure", props);
    },

    onPreDelete: ({
                      schema,
                      path,
                      entityId,
                      entity,
                      context
                  }: EntityOnDeleteProps<Product>
    ) => {
        if (context.authController.user)
            throw Error("Product deletion not allowed");
    },

    onDelete: (props: EntityOnDeleteProps<Product>) => {
        console.log("onDelete", props);
    }
});

const productsCollection = buildCollection<Product>({
    name: "Products",
    path: "products",
    schema: productSchema,
    callbacks: productCallbacks
});
