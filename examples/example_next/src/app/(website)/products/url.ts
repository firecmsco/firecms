export function parseQuery(params?: Map<string, string> | URLSearchParams) {

    if(!params) {
        return {};
    }

    // @ts-expect-error
    const category = params["category"];

    // @ts-expect-error
    const priceMin = parseFloat(params["priceMin"] || "");

    // @ts-expect-error
    const priceMax = parseFloat(params["priceMax"] || "");

    return {
        category: category ?? undefined,
        priceMax: isNaN(priceMax) ? undefined : priceMax,
        priceMin: isNaN(priceMin) ? undefined : priceMin
    }

}
