import { buildCollection } from "@firecms/core";
import { OpenInFullIcon } from "@firecms/ui";
import { surveysCollection } from "@/app/cms/collections/surveys";

export const usersCollection = buildCollection({
    id: "users",
    path: "users",
    name: "Users",
    singularName: "User",
    icon: "person",
    textSearchEnabled: true,
    properties: {
        name: {
            dataType: "string",
            name: "Name",
            validation: { required: true }
        },
        email: {
            dataType: "string",
            name: "Email",
            validation: { required: true }
        },
        survey: {
            name: "Survey",
            dataType: "map",
            properties: surveysCollection.properties
        }
    },
    entityActions: [
        {
            name: "See user website",
            icon: <OpenInFullIcon/>,
            onClick: async ({ entity }) => {
                // navigate to user website
                window.open(`/users/${entity.id}`, '_blank');
            }
        }
    ],
    subcollections: [
        {
            id: "recipes",
            path: "recipes",
            name: "Recipes for user",
            singularName: "Recipe for user",
            properties: {
                recipe: {
                    dataType: "reference",
                    name: "Recipe",
                    path: "recipes",
                    validation: { required: true }
                },
                instructions: {
                    name: "Instructions",
                    dataType: "string",
                    markdown: true
                },
                created_on: {
                    dataType: "date",
                    name: "Created on",
                    autoValue: "on_create"
                }
            }
        }
    ]
});
