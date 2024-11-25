"use client";

import { Checkbox, cls } from "@firecms/ui";
import { IngredientMapping, IngredientsSection } from "../types";
import React from "react";


export function Ingredients({ section }: { section: IngredientsSection }) {
    if (!section) return <></>;
    return (
        <div className="font-headers mb-8 max-w-3xl">
            {section.name &&
                <h6 className="text-xl font-semibold dark:text-primary mb-2">{section.name}</h6>}
            <table className="list-none text-base text-gray-700 dark:text-gray-300">
                <tbody>
                {section.ingredients.map((ingredient, index) => (
                    <IngredientEntry key={`ingredient_${index}`} ingredient={ingredient}/>
                ))}
                </tbody>
            </table>
        </div>
    );
}

function IngredientEntry(props: { ingredient: IngredientMapping }) {

    const [checked, setChecked] = React.useState(false);

    return <tr className={cls("my-1 cursor-pointer", checked ? "text-text-secondary dark:text-text-secondary-dark" : "text-text-primary dark:text-text-primary-dark")}
               onClick={() => setChecked(!checked)}>
        <td className={"pt-1 pr-2"}>
            <Checkbox checked={checked}
                      onCheckedChange={setChecked}
                      size={"smallest"}
                      color={"secondary"}/>
        </td>
        <td className="text-base align-left min-w-24">{props.ingredient.quantity}</td>
        <td className="text-base font-bold pl-4">{props.ingredient.ingredient?.name}</td>
    </tr>;
}
