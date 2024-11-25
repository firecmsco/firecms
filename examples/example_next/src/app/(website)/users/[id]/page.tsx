import { getUserRecipes } from "@/app/common/api";
import RecipePreviewCard from "@/app/common/components/RecipePreview";

export default async function Page({ params }: { params: { id: string } }) {

    const userRecipes = await getUserRecipes(params.id);
    return (
        <div className={"w-full bg-white"}>
            <div className={"mx-auto max-w-5xl my-24"}>

                <h1 className="typography-h1 my-16">Rezepte</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userRecipes.map((recipe) => (
                        <RecipePreviewCard key={recipe.recipe.id} recipe={recipe.recipe} instructions={recipe.instructions}/>
                    ))}
                </div>

            </div>
        </div>

    );
}


