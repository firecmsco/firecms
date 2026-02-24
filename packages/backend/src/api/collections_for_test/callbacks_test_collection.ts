import { EntityCollection } from "@firecms/types";

export const callbacksTestCollection: EntityCollection<any> = {
    name: "Callback Tests",
    slug: "callback_tests",
    dbPath: "callback_tests",
    description: "A collection to test backend callbacks",
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            type: "string"
        },
        hasSaveSuccessTriggered: {
            name: "Save Success Triggered",
            type: "boolean"
        },
        hasPreSaveTriggered: {
            name: "Pre Save Triggered",
            type: "boolean"
        },
        hasFetchTriggered: {
            name: "Fetch Triggered",
            type: "boolean"
        }
    },
    callbacks: {
        onPreSave: (props: any) => {
            console.log("🔥 [BACKEND_CALLBACK] onPreSave Triggered!", props);
            return {
                ...props.values,
                hasPreSaveTriggered: true,
                name: props.values.name + " (PreSaved)" // Modifying value before save
            };
        },
        onSaveSuccess: (props: any) => {
            console.log("🔥 [BACKEND_CALLBACK] onSaveSuccess Triggered!", props);
            // This usually triggers other side effects (emails, notifications), log for now
        },
        onSaveFailure: (props: any) => {
            console.error("🔥 [BACKEND_CALLBACK] onSaveFailure Triggered!", props);
        },
        onFetch: (props: any) => {
            console.log("🔥 [BACKEND_CALLBACK] onFetch Triggered!", props);
            return {
                ...props.entity.values,
                hasFetchTriggered: true
            };
        },
        onPreDelete: (props: any) => {
            console.log("🔥 [BACKEND_CALLBACK] onPreDelete Triggered!", props);
        },
        onDelete: (props: any) => {
            console.log("🔥 [BACKEND_CALLBACK] onDelete Triggered!", props);
        }
    }
};
