"use client";
import React from "react";
import { Recipe } from "../types";
import Link from 'next/link'
import { getDurationString } from "../utils";
import { ClientIcon } from "@/app/common/components/ClientIcon";


interface RecipePreviewCardProps {
    recipe: Recipe;
    instructions?: string;
}


const RecipePreviewCard: React.FC<RecipePreviewCardProps> = ({ recipe, instructions }) => {
    return (
        <Link href={"/recipes/" + recipe.id}
              className="relative h-72 block w-full rounded overflow-hidden shadow-lg bg-gray-600 hover:shadow-xl transition duration-300 hover:scale-[1.02] text-white">
            {recipe.imageUrl && (
                <img className="absolute h-full w-full object-cover" src={recipe.imageUrl}
                     alt={recipe.name}/>
            )}

            <div
                className={"h-full relative flex flex-col justify-end bg-gradient-to-t from-gray-900 to-70% pb-2"}>
                <div className="px-6 typography-h6">{recipe.name}</div>
                <div className="px-6 my-1 flex gap-4">
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

                {instructions && (
                    <div className="px-6 py-4">
                        <p className="text-white text-base italic">{instructions}</p>
                    </div>
                )}
            </div>

        </Link>
    );
};

export default RecipePreviewCard;
