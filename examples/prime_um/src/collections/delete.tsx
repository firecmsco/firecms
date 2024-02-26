import { buildCollection } from "@firecms/core";
import { ClientSet } from "../types";

export const deleteCollection = buildCollection<any>({
    name: "delete",
    id: "delete",
    path: "delete",
    callbacks: {
        onPreSave(entitySaveProps) {
            throw new Error("Method not implemented.");
        }
    },
    properties: {
        name: {
            name: "Name",
            dataType: "string"
        },
    }
})
