import React from "react";
import { buildSchema } from "@camberi/firecms";

export const usersSchema = buildSchema({
    name: "User",
    properties: {
        first_name: {
            title: "First name",
            dataType: "string"
        },
        last_name: {
            title: "Last name",
            dataType: "string"
        },
        email: {
            title: "Email",
            dataType: "string",
            validation: {
                email: true
            }
        },
        phone: {
            title: "Phone",
            dataType: "string"
        },
        picture: {
            title: "Picture",
            dataType: "map",
            properties: {
                large: {
                    title: "Large",
                    dataType: "string",
                    config: {
                        url: "image"
                    },
                    validation: {
                        url: true
                    }
                },
                thumbnail: {
                    title: "Thumbnail",
                    dataType: "string",
                    config: {
                        url: "image"
                    },
                    validation: {
                        url: true
                    }
                }
            },
            previewProperties: ["large"]
        }
    }
});
