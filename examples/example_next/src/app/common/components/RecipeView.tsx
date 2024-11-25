import React from "react";
import { IngredientsSection, Intolerance, Recipe } from "../types";
import { MarkdownView } from "./Markdown";
import { getDurationString } from "@/app/common/utils";
import { ClientIcon } from "./ClientIcon";
import { Ingredients } from "./Ingredients";

export function RecipeView({ recipe }: { recipe: Recipe }) {

    return (
        <div className="relative bg-white dark:bg-gray-900 w-full">

            <div
                className={"relative h-[700px] md:h-[500px] block w-full overflow-hidden shadow-lg bg-gray-600 transition duration-300 text-white"}>
                {recipe?.imageUrl && <div>
                    <img alt="Header"
                         className="absolute h-full w-full object-cover"
                         src={recipe?.imageUrl}/>
                </div>}

                <div
                    className={"h-full relative flex flex-col justify-end bg-gradient-to-t from-gray-900 to-70%"}>
                    <div className={"w-full max-w-4xl mx-auto p-4 "}>
                        <h1 className="typography-h1 mb-6">{recipe?.name}</h1>
                        <div className="my-2 flex gap-4">
                            {recipe.duration && <span
                                className="flex gap-2 text-white  py-1 text-sm font-semibold mr-2 mb-2 items-center">
                            <ClientIcon iconKey={"access_time"}
                                        size={"smallest"}/> <b>{recipe.duration + " " + getDurationString(recipe)}</b>
                            </span>}
                            {recipe.portions && <span
                                className="flex gap-2 text-white py-1 text-sm font-semibold mr-2 mb-2 items-center">
                            <ClientIcon iconKey={"restaurant"}
                                        size={"smallest"}/> <b>{recipe.portions + " " + (recipe.portions_unit ?? "")}</b>
                            </span>}
                        </div>
                    </div>


                </div>


            </div>
            <div className={"max-w-4xl m-auto p-4 py-16"}>

                {recipe?.description &&
                    <p className="text-4xl text-gray-700 dark:text-gray-300 mb-6 font-headers-small">{recipe?.description}</p>}

                {recipe?.author && <div className="mb-4 flex flex-row gap-2 items-center">
                    {recipe?.author.image &&
                        <img className={"rounded-full h-12 w-12 object-cover"}
                             src={recipe.author.image}
                             alt={recipe.author.name}/>}
                    <span
                        className="text-gray-700 dark:text-gray-300 typography-label font-bold">{recipe.author.name}</span>
                </div>}


                <div className="mb-12 mt-8">
                    <h5 className="mb-4 typography-h4 text-text-secondary dark:text-gray-200 ">
                        Zutaten:
                    </h5>
                    <div className={"md:grid md:grid-cols-2"}>
                        {recipe?.ingredients && recipe.ingredients
                            .filter((e) => !!e)
                            .map((section: IngredientsSection, index: number) => (
                                section
                                    ? <Ingredients key={`preview_text_${index}`} section={section}/>
                                    :
                                    <div key={`preview_text_${index}`} className="text-red-600">Unexpected value in
                                        recipe
                                        entry</div>
                            ))}
                    </div>
                </div>
                {recipe.videoUrl && <>
                    <hr className="border-dashed border-secondary my-8"/>
                    <div className="my-16">
                        <video className="mx-auto w-auto max-w-4xl shadow-md rounded-2xl max-h-[85dvh]" controls>
                            <source src={recipe.videoUrl} type="video/mp4"/>
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </>}


                <hr className="border-dashed border-secondary my-8"/>

                <div>
                    <h5 className="mt-12 mb-4 typography-h4 text-text-secondary dark:text-gray-200 ">
                        Vorbereitung:
                    </h5>
                    {recipe?.preparation && <Text markdownText={recipe?.preparation}/>}
                </div>

                {recipe.intolerances && <>
                    <hr className="border-dashed border-secondary my-8"/>
                    <IntolerancesView
                        intolerances={recipe.intolerances}/>
                </>}

            </div>

        </div>
    );
}


function Text({ markdownText }: { markdownText: string }) {
    if (!markdownText) return <></>;
    return (
        <div className="mb-8 mx-auto">
            <MarkdownView source={markdownText}/>
        </div>
    );
}

function IntolerancesView({ intolerances }: {
    intolerances: Array<{
        intolerance: Intolerance;
        indications?: string;
        status: "safe" | "adaptable" | "unsafe";
    }>
}) {
    if (!intolerances || intolerances.length === 0) return <></>;

    const statusColor = (status: "safe" | "adaptable" | "unsafe") => {
        switch (status) {
            case "safe":
                return "bg-green-100 text-green-700";
            case "adaptable":
                return "bg-yellow-100 text-yellow-700";
            case "unsafe":
                return "bg-red-100 text-red-700";
        }
    }
    return (
        <div className={"mb-12"}>
            <h5 className="mb-4 typography-h4 text-text-secondary dark:text-gray-200 ">
                Intoleranzen:
            </h5>
            <div className="grid grid-cols-1 gap-4">
                {intolerances.map((intolerance, index) => (
                    <div key={`intolerance_${index}`}
                         className={"bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md " + statusColor(intolerance.status ?? "safe")}>
                        <h6 className="typography-h6">{intolerance.intolerance.name}</h6>
                        <p className="text-sm ">{intolerance.indications}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

