import { DocumentReference, Timestamp } from "@firebase/firestore";

export type UserRecipe = {
    recipe: Recipe;
    instructions: string;
    created_on: Date;
}

export type Recipe = {
    id: string;
    name: string;
    created_on: Date;
    imageUrl?: string;
    videoUrl?: string;
    description: string;
    portions: number;
    portions_unit: string;
    duration: number;
    duration_unit: string;
    ingredients: Array<IngredientsSection>;
    preparation: string;
    comment: string;
    author?: Author;
    intolerances: Array<{
        intolerance: Intolerance;
        indications?: string;
        status: "safe" | "adaptable" | "unsafe";
    }>;
    intolerances_matrix?: Map<string, "safe" | "adaptable" | "unsafe">;
    diet: Diet;
    category: RecipeCategory;
}

export type Author = {
    name: string;
    email: string;
    image: string;
    bio: string;
}

export type RecipeCategory = "breakfast" | "lunch" | "dinner" | "snack" | "dessert" | "drink" | "salad" | "soup" | "meal_prep" | "lunch_to_go" | "dressing";
export type Diet = "vegan" | "vegetarian" | "paleo" | "keto" | "pescatarian" | "omnivore";

export type DatabaseRecipe = {
    name: string;
    image?: string;
    video?: string;
    cooking_status?: string;
    description: string;
    portions: number;
    portions_unit: string;
    duration: number;
    duration_unit: string;
    ingredients: Array<{
        name?: string; // Section Name (optional)
        ingredients: {
            quantity: string;
            ingredient: DocumentReference;
            description: string;
            optional: boolean;
        }[];
    }>;
    // this is generated with a cloud function
    ingredient_slugs: string[];
    preparation: string;
    additional_images?: string[];
    comment: string;
    author?: DocumentReference;
    intolerances: Array<{
        intolerance: DocumentReference;
        indications: string;
        status: "safe" | "adaptable" | "unsafe";
    }>;
    intolerances_verified: boolean;
    // this is generated with a cloud function
    intolerances_matrix?: Map<string, "safe" | "adaptable" | "unsafe">;
    created_on: Date;
    diet: Diet;
    category: RecipeCategory;
}

export type IngredientsSection = {
    name?: string; // Section Name (optional)
    ingredients: IngredientMapping[];
};

export type IngredientMapping = {
    quantity: string;
    ingredient: Ingredient | null;
    description: string;
    optional: boolean;
}

export type Ingredient = {
    id: string;
    name: string;
    description: string;
}

export type Intolerance = {
    id: string;
    name: string;
    description: string;
}

export type SurveyData = {
    name?: string;
    email?: string;
    foodType?: "Vegetarian" | "Vegan" | "Keto" | "Paleo" | "Pescatarian" | "Omnivore";
    mealPattern?: "Snacks" | "One meal" | "Two meals" | "Three meals";
    dietAspect?: "Taste" | "Convenience" | "Healthiness" | "Variety";
    nutritionalRequirement?: ("Low carb" | "Low fat" | "High protein" | "Gluten-free")[];
    goal?: "Weight loss" | "Muscle gain" | "Maintain weight";
};
