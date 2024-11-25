import React, { useEffect } from "react";
import { EntityCustomViewParams } from "@firecms/core";
import { DatabaseRecipe, Recipe } from "@/app/common/types";
import { RecipeView } from "@/app/common/components/RecipeView";
import { convertRecipe } from "@/app/common/api";
import { Button } from "@firecms/ui";

export function RecipeCMSPreview({ modifiedValues, entity }: EntityCustomViewParams<DatabaseRecipe>) {

    const [convertedRecipe, setConvertedRecipe] = React.useState<Recipe | null>(null);
    useEffect(() => {
        if (modifiedValues)
            convertRecipe(modifiedValues, entity?.id ?? "temp_id").then(setConvertedRecipe);
    }, [modifiedValues]);

    if (!modifiedValues)
        return null;

    if (!convertedRecipe)
        return <div>Loading...</div>;

    return <div className={"relative"}>
        {entity?.id && <Button component="a"
                               rel="noopener noreferrer"
                               target="_blank"
                               href={"/recipes/" + entity?.id}
                               className={"absolute top-4 right-4"}>
            Live preview
        </Button>}
        <RecipeView recipe={convertedRecipe}/>
    </div>;
}
