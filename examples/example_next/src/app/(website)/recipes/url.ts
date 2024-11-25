export function parseQuery(params: Map<string, string> | URLSearchParams) {

    // @ts-ignore
    const ingredients = (params["ingredients"]?.split(',') || []).filter(Boolean);
    // @ts-ignore
    const categories = (params["categories"]?.split(',') || []).filter(Boolean);
    // @ts-ignore
    const diets = (params["diet"]?.split(',') || []).filter(Boolean);
    // @ts-ignore
    const intolerances = (params["intolerances"]?.split(',') || []).filter(Boolean);

    return {
        ingredients,
        category: categories ? categories[0] : undefined,
        diet: diets ? diets[0] : undefined,
        intolerances
    }

}
