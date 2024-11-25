import { buildCollection, EntityIdUpdateProps } from "@firecms/core";
import { PersonAddIcon } from "@firecms/ui";


export const surveysCollection = buildCollection({
    id: "surveys",
    path: "surveys",
    name: "Surveys",
    icon: "poll",
    textSearchEnabled: true,
    entityActions: [{
        name: "Create user from survey",
        icon: <PersonAddIcon/>,
        onClick: async ({ entity, context }) => {
            const dataSource = context.dataSource;
            dataSource.saveEntity({
                status: "new",
                path: "users",
                entityId: entity.id,
                values: {
                    name: entity.values.name,
                    email: entity.values.email,
                    survey: entity.values
                }
            }).then(() => {
                context.snackbarController.open({
                    message: "User created",
                    type: "success"
                });
            });
            console.log("Creating user from survey", entity);
        }
    }],
    callbacks: {
        onIdUpdate(idUpdateProps: EntityIdUpdateProps): string | Promise<string> {

            // @ts-ignore
            if (!idUpdateProps.values.name)
                return "_";
            // @ts-ignore
            return idUpdateProps.values.name.toLowerCase().replace(/ /g, "_").replace(/\//g, "_");
        }
    },
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
        foodType: {
            dataType: "string",
            name: "Food Type",
            enumValues: {
                Vegetarian: "Vegetarian",
                Vegan: "Vegan",
                Keto: "Keto",
                Paleo: "Paleo",
                Pescatarian: "Pescatarian",
                Omnivore: "Omnivore"
            }
        },
        mealPattern: {
            dataType: "string",
            name: "Meal Pattern",
            enumValues: {
                Snacks: "Snacks",
                "One meal": "One meal",
                "Two meals": "Two meals",
                "Three meals": "Three meals"
            }
        },
        dietAspect: {
            dataType: "string",
            name: "Diet Aspect",
            enumValues: {
                Taste: "Taste",
                Convenience: "Convenience",
                Healthiness: "Healthiness",
                Variety: "Variety"
            }
        },
        nutritionalRequirement: {
            dataType: "array",
            name: "Nutritional Requirement",
            of: {
                dataType: "string",
                enumValues: {
                    "Low carb": "Low carb",
                    "Low fat": "Low fat",
                    "High protein": "High protein",
                    "Gluten-free": "Gluten-free"
                }
            }
        },
        goal: {
            dataType: "string",
            name: "Goal",
            enumValues: {
                "Weight loss": "Weight loss",
                "Muscle gain": "Muscle gain",
                "Maintain weight": "Maintain weight"
            }
        }
    }
});
