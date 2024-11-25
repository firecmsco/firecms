import React from "react";

import { getIntolerances, getRecipes } from "@/app/common/api";
import { RecipesView } from "./RecipesView";
import { parseQuery } from "./url";

export default async function Page(props: any) {
    const filters = parseQuery(props.searchParams);
    console.log("Filters", filters);
    const recipes = await getRecipes({
        limit: 10,
        ingredientsFilter: filters.ingredients,
        categoryFilter: filters.category,
        dietFilter: filters.diet,
        intolerancesFilter: filters.intolerances
    });
    const intolerances = await getIntolerances();
    return <RecipesView initialRecipes={recipes}
                        initialIngredientsFilter={filters.ingredients}
                        initialCategoryFilter={filters.category}
                        initialDietFilter={filters.diet}
                        initialIntolerancesFilter={filters.intolerances}
                        intolerances={intolerances}/>;
}
