import React from "react";
import { RecipeView } from "@/app/common/components/RecipeView";
import { getIntolerances, getRecipe } from "@/app/common/api";

export default async function Page({ params }: { params: { id: string } }) {
    let data = await getRecipe(params.id);
    if (!data) {
        return <div>Recipe not found</div>;
    }
    const intolerances = await getIntolerances();

    //     intolerances: Array<{
    //         intolerance: Intolerance;
    //         indications: string;
    //         status: "safe" | "adaptable" | "unsafe";
    //     }>;
    // mark missing intolerances in recipe as status safe
    data.intolerances = intolerances.map(intolerance => {
        const existing = data.intolerances.find(i => i.intolerance.id === intolerance.id);
        if (existing) {
            return existing;
        }
        return {
            intolerance,
            status: "safe"
        }
    });

    return (
        <RecipeView recipe={data}/>
    )
}


