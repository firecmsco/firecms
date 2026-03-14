import { EntityCollection } from "@rebasepro/types";

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
        beforeSave: (props: any) => {
            console.log("🔥 [BACKEND_CALLBACK] beforeSave Triggered!", props);
            return {
                ...props.values,
                hasPreSaveTriggered: true,
                name: props.values.name + " (PreSaved)" // Modifying value before save
            };
        },
        afterSave: (props: any) => {
            console.log("🔥 [BACKEND_CALLBACK] afterSave Triggered!", props);
            // This usually triggers other side effects (emails, notifications), log for now
        },
        afterSaveError: (props: any) => {
            console.error("🔥 [BACKEND_CALLBACK] afterSaveError Triggered!", props);
        },
        afterRead: (props: any) => {
            console.log("🔥 [BACKEND_CALLBACK] afterRead Triggered!", props);
            return {
                ...props.entity.values,
                hasFetchTriggered: true
            };
        },
        beforeDelete: (props: any) => {
            console.log("🔥 [BACKEND_CALLBACK] beforeDelete Triggered!", props);
        },
        afterDelete: (props: any) => {
            console.log("🔥 [BACKEND_CALLBACK] afterDelete Triggered!", props);
        }
    }
};
