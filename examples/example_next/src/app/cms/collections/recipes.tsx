import { buildCollection } from "@firecms/core";
import { DatabaseRecipe } from "@/app/common/types";
import { RecipeCMSPreview } from "./entity_views/RecipeCMSPreview";
import { IngredientMappingField } from "./fields/IngredientMappingField";

export const recipesCollection = buildCollection<DatabaseRecipe>({
        id: "recipes",
        path: "recipes",
        name: "Recipes",
        icon: "restaurant",
        description: "Collection of various recipes",
        sideDialogWidth: 900,
        textSearchEnabled: true,
        entityViews: [{
            key: "preview",
            name: "Preview",
            Builder: RecipeCMSPreview
        }],
        properties: {
            name: {
                dataType: "string",
                name: "Recipe Name"
            },
            image: {
                dataType: "string",
                name: "Main Image",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"],
                    metadata: {
                        contentType: "image/*"
                    }
                },
            },
            video: {
                dataType: "string",
                name: "Video URL",
                storage: {
                    storagePath: "videos",
                    acceptedFiles: ["video/*"],
                    metadata: {
                        contentType: "video/*"
                    }
                },
            },
            cooking_status: {
                dataType: "string",
                name: "Cooking Status",
                enumValues: [
                    {
                        id: "not_specified",
                        label: "Not Specified",
                        color: "grayLight"
                    },
                    {
                        id: "not_tested",
                        label: "Not tested",
                        color: "redLighter"
                    },
                    {
                        id: "tested_once",
                        label: "Tested once",
                        color: "yellowLighter"
                    },
                    {
                        id: "tested_twice",
                        label: "Tested twice",
                        color: "yellowLight"
                    },
                    {
                        id: "tested_multiple_times",
                        label: "Tested multiple times",
                        color: "yellowDark"
                    },
                    {
                        id: "ready_to_be_posted",
                        label: "Ready to be posted",
                        color: "greenLight"
                    },
                    {
                        id: "posted",
                        label: "Posted",
                        color: "greenDark"
                    },
                    {
                        id: "revised_and_posted",
                        label: "Revised and Posted",
                        color: "greenDarker"
                    }
                ],
                defaultValue: "not_tested"
            },
            comment: {
                dataType: "string",
                multiline: true,
                name: "Comment",
                description: "Internal comments, not displayed to end users"
            },

            description: {
                dataType: "string",
                name: "Description"
            },
            portions: {
                dataType: "number",
                name: "Portions"
            },
            portions_unit: {
                dataType: "string",
                name: "Portions unit"
            },
            duration: {
                dataType: "number",
                name: "Duration"
            },
            duration_unit: {
                dataType: "string",
                name: "Duration unit",
                enumValues: [
                    {
                        id: "minutes",
                        label: "Minutes"
                    },
                    {
                        id: "hours",
                        label: "Hours"
                    },
                    {
                        id: "days",
                        label: "Days"
                    }
                ],
            },
            category: {
                dataType: "string",
                name: "Category",
                enumValues: [
                    {
                        id: "breakfast",
                        label: "Breakfast",
                        color: "greenLight"
                    },
                    {
                        id: "lunch",
                        label: "Lunch",
                        color: "greenDark"
                    },
                    {
                        id: "dinner",
                        label: "Dinner",
                        color: "yellowLight"
                    },
                    {
                        id: "snack",
                        label: "Snack",
                        color: "grayLight"
                    },
                    {
                        id: "dessert",
                        label: "Dessert",
                        color: "blueLight"
                    },
                    {
                        id: "drink",
                        label: "Drink",
                        color: "grayDark"
                    },
                    {
                        id: "salad",
                        label: "Salad",
                        color: "greenLight"
                    },
                    {
                        id: "soup",
                        label: "Soup",
                        color: "greenDark"
                    },
                    {
                        id: "meal_prep",
                        label: "Meal Prep",
                        color: "yellowLight"
                    },
                    {
                        id: "lunch_to_go",
                        label: "Lunch to Go",
                        color: "grayLight"
                    },
                    {
                        id: "dressing",
                        label: "Dressing",
                        color: "blueLight"
                    }
                ]
            },

            diet: {
                dataType: "string",
                name: "Diet",
                enumValues: [
                    {
                        id: "vegan",
                        label: "Vegan",
                        color: "greenLight"
                    },
                    {
                        id: "vegetarian",
                        label: "Vegetarian",
                        color: "greenDark"
                    },
                    {
                        id: "paleo",
                        label: "Paleo",
                        color: "yellowLight"
                    },
                    {
                        id: "keto",
                        label: "Keto",
                        color: "grayLight"
                    },
                    {
                        id: "pescatarian",
                        label: "Pescatarian",
                        color: "blueLight"
                    },
                    {
                        id: "omnivore",
                        label: "Omnivore",
                        color: "grayDark"
                    }
                ],
            },
            ingredients: {
                dataType: "array",
                name: "Ingredient sections",
                of: {
                    dataType: "map",
                    name: "Ingredient section",
                    properties: {
                        name: {
                            dataType: "string",
                            name: "Section Name (optional)",
                        },
                        ingredients: {
                            dataType: "array",
                            name: "Ingredients",
                            of: {
                                dataType: "map",
                                properties: {
                                    quantity: {
                                        dataType: "string",
                                        name: "Quantity"
                                    },
                                    ingredient: {
                                        name: "Ingredient",
                                        dataType: "reference",
                                        path: "ingredients",
                                    },
                                    description: {
                                        dataType: "string",
                                        name: "Description",
                                    },
                                    optional: {
                                        dataType: "boolean",
                                        name: "Optional",
                                    }
                                },
                                Field: IngredientMappingField
                            }
                        },
                    }
                }
            },
            preparation: {
                dataType: "string",
                markdown: true,
                name: "Preparation Steps",
            },

            additional_images: {
                dataType: "array",
                name: "Additional Images",
                description: "These images are not displayed in the website, are only for CMS purposes",
                of: {
                    dataType: "string",
                    storage: {
                        storagePath: "images",
                        acceptedFiles: ["image/*"],
                        metadata: {
                            contentType: "image/*"
                        }
                    }
                }
            },
            author: {
                dataType: "reference",
                path: "authors",
                name: "Author",
            },
            intolerances_verified: {
                dataType: "boolean",
                name: "Intolerances verified",
                description: "If the intolerances have been verified by the author. This is not displayed to end users",
            },
            intolerances: {
                dataType: "array",
                name: "Intolerances",
                description: "Intolerances related to this recipe. If an intolerance is not listed, it is considered in the safe status by default.",
                of: {
                    dataType: "map",
                    properties: {
                        intolerance: {
                            dataType: "reference",
                            path: "intolerances",
                            name: "Intolerance",
                        },
                        indications: {
                            dataType: "string",
                            name: "Indications",
                            multiline: true
                        },
                        status: {
                            dataType: "string",
                            name: "Status",
                            enumValues: [
                                {
                                    id: "safe",
                                    label: "Safe",
                                    color: "greenLight"
                                },
                                {
                                    id: "adaptable",
                                    label: "Adaptable",
                                    color: "yellowLight"
                                },
                                {
                                    id: "unsafe",
                                    label: "Unsafe",
                                    color: "redLight"
                                }
                            ]
                        }
                    }
                }
            },
            created_on: {
                dataType: "date",
                name: "Created on",
                autoValue: "on_create"
            },
            ingredient_slugs: {
                dataType: "array",
                name: "Ingredient slugs",
                readOnly: true,
                of: {
                    dataType: "string"
                }
            }
        }
    }
);
