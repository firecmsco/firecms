import { EntityCollection, EntityBeforeSaveProps, EntityAfterSaveProps, EntityAfterSaveErrorProps, EntityAfterReadProps, EntityBeforeDeleteProps, EntityAfterDeleteProps, PostgresCollection } from "@rebasepro/types";

export const callbacksTestCollection: PostgresCollection = {
    name: "Callback Tests",
    slug: "callback_tests",
    table: "callback_tests",
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
        beforeSave: (props: EntityBeforeSaveProps) => {
            console.log("🔥 [BACKEND_CALLBACK] beforeSave Triggered!", props);
            return {
                ...props.values,
                hasPreSaveTriggered: true,
                name: props.values.name + " (PreSaved)" // Modifying value before save
            };
        },
        afterSave: (props: EntityAfterSaveProps) => {
            console.log("🔥 [BACKEND_CALLBACK] afterSave Triggered!", props);
            // This usually triggers other side effects (emails, notifications), log for now
        },
        afterSaveError: (props: EntityAfterSaveErrorProps) => {
            console.error("🔥 [BACKEND_CALLBACK] afterSaveError Triggered!", props);
        },
        afterRead: (props: EntityAfterReadProps) => {
            console.log("🔥 [BACKEND_CALLBACK] afterRead Triggered!", props);
            return {
                ...props.entity.values,
                hasFetchTriggered: true
            };
        },
        beforeDelete: (props: EntityBeforeDeleteProps) => {
            console.log("🔥 [BACKEND_CALLBACK] beforeDelete Triggered!", props);
        },
        afterDelete: (props: EntityAfterDeleteProps) => {
            console.log("🔥 [BACKEND_CALLBACK] afterDelete Triggered!", props);
        }
    }
};
