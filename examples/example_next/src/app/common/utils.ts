import { Recipe } from "./types";

export function getDurationString(recipe: Recipe) {
    switch(recipe.duration_unit) {
        case "minutes":
            return "Minuten";
        case "hours":
            return "Stunden";
        case "days":
            return "Tage";
    }
    return recipe.duration_unit ?? "";
}
