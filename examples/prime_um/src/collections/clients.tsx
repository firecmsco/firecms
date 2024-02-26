import { buildCollection } from "@firecms/core";
import { Client, ClientSet } from "../types";
import { shareOfShelfCollection, shelfCollection } from "./shelves";

export const clientSetCollection = buildCollection<ClientSet>({
    name: "Client Sets",
    singularName: "Client Set",
    id: "client_sets",
    path: "client_sets",
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        asins: {
            name: "ASINs",
            validation: { required: true },
            dataType: "array",
            of: { dataType: "string", previewAsTag: true }
        },
        created_on: {
            name: "Created on",
            dataType: "date",
            autoValue: "on_create"
        },
    }
})


export const clientsCollection = buildCollection<Client>({
    name: "Client",
    singularName: "Client",
    id: "clients",
    path: "clients",
    icon: "person",
    group: "Data",
    permissions: ({ authController, user }) => ({
        read: true,
        edit: true,
        create: true,
        delete: true
    }),
    subcollections: [clientSetCollection, shelfCollection, shareOfShelfCollection],
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        created_on: {
            name: "Created on",
            dataType: "date",
            autoValue: "on_create"
        }
    }
});

