"use client";
import React, { useEffect, useRef, useState } from "react";
import { getIngredients, getRecipes } from "@/app/common/api";
import RecipePreviewCard from "@/app/common/components/RecipePreview";
import { Diet, Ingredient, Intolerance, Recipe, RecipeCategory } from "@/app/common/types";
import {
    Chip,
    CircularProgress,
    CloseIcon,
    IconButton,
    MultiSelect,
    MultiSelectItem,
    Sheet,
    Tab,
    Tabs,
    TuneIcon,
    Typography
} from "@firecms/ui";
import { parseQuery } from "@/app/(website)/recipes/url";

export function RecipesView({
                                intolerances,
                                initialRecipes,
                                initialIngredientsFilter,
                                initialCategoryFilter,
                                initialDietFilter,
                                initialIntolerancesFilter
                            }: {
    intolerances: Intolerance[],
    initialRecipes: Recipe[],
    initialIngredientsFilter: string[],
    initialCategoryFilter: string,
    initialDietFilter: string,
    initialIntolerancesFilter: string[]
}) {

    const limit = useRef(initialRecipes.length);
    const noMoreToLoad = useRef(false);
    const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes ?? []);
    const [loading, setLoading] = useState(false);

    const ingredientsFilterRef = useRef<string[]>(initialIngredientsFilter ?? []);
    const [ingredientsFilter, setIngredientsFilter] = useState<string[]>(initialIngredientsFilter ?? []);

    const [categoryFilter, setCategoryFilter] = useState<string | undefined>(initialCategoryFilter ?? undefined);
    const categoryFilterRef = useRef<string | undefined>(initialCategoryFilter ?? undefined);

    const [dietFilter, setDietFilter] = useState<string | undefined>(initialDietFilter ?? undefined);
    const dietFilterRef = useRef<string | undefined>(initialDietFilter ?? undefined);

    const [intolerancesFilter, setIntolerancesFilter] = useState<string[]>(initialIntolerancesFilter);
    const intolerancesFilterRef = useRef<string[]>(initialIntolerancesFilter);

    const [filtersOpen, setFiltersOpen] = useState(false);

    function getFilters() {
        const params = new URLSearchParams(window.location.search);
        return parseQuery(params);
    }

    useEffect(() => {
        const updateURLFilter = () => {
            if (typeof window !== 'undefined') {
                const filters = getFilters();
                ingredientsFilterRef.current = filters.ingredients ?? [];
                setIngredientsFilter(filters.ingredients ?? []);
                categoryFilterRef.current = filters.category ?? [];
                setCategoryFilter(filters.category ?? []);
                dietFilterRef.current = filters.diet ?? [];
                setDietFilter(filters.diet ?? []);
                intolerancesFilterRef.current = filters.intolerances ?? [];
                setIntolerancesFilter(filters.intolerances ?? []);
            }
        };

        window.addEventListener('popstate', updateURLFilter);

        return () => {
            window.removeEventListener('popstate', updateURLFilter);
        };
    }, []);

    const loadRecipes = async function loadRecipes() {
        const newLimit = recipes.length + 10;
        if (newLimit === limit.current || noMoreToLoad.current) {
            return;
        }
        limit.current = newLimit;
        setLoading(true);
        const newRecipes = await getRecipes({
            limit: newLimit,
            ingredientsFilter: ingredientsFilterRef.current,
            categoryFilter: categoryFilterRef.current ?? undefined,
            intolerancesFilter: intolerancesFilterRef.current ?? undefined,
            dietFilter: dietFilterRef.current ?? undefined
        }).finally(() => setLoading(false));
        noMoreToLoad.current = newRecipes.length !== newLimit;
        setRecipes(newRecipes);
    };

    useEffect(() => {

        const handleScroll = async () => {
            if (window.innerHeight + document.documentElement.scrollTop + 500 >= document.documentElement.offsetHeight) {
                await loadRecipes();
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [loadRecipes]);

    function updatedURLFilterParams(key: string, newValue?: string[]) {
        const searchParams = new URLSearchParams();
        if (newValue && (newValue ?? []).length > 0) {
            searchParams.set(key, newValue.join(','));
        } else {
            searchParams.delete(key);
        }
        if (searchParams.size === 0) {
            window.history.replaceState({}, '', `${window.location.pathname}`);
        } else {
            window.history.replaceState({}, '', `${window.location.pathname}?${searchParams.toString()}`);
        }
    }

    function updateIngredientsFilter(newIngredients: string[]) {
        ingredientsFilterRef.current = newIngredients;
        setIngredientsFilter(newIngredients);
        updatedURLFilterParams('ingredients', newIngredients);
        setRecipes([]);
        limit.current = 0;
        noMoreToLoad.current = false;
        loadRecipes();
    }

    function updateCategoriesFilter(newCategory: string | undefined) {
        categoryFilterRef.current = newCategory;
        setCategoryFilter(newCategory);
        updatedURLFilterParams('category', newCategory ? [newCategory] : undefined);
        setRecipes([]);
        limit.current = 0;
        noMoreToLoad.current = false;
        loadRecipes();
    }

    function updateDietsFilter(newDiet: string | undefined) {
        dietFilterRef.current = newDiet;
        setDietFilter(newDiet);
        updatedURLFilterParams('diet', newDiet ? [newDiet] : undefined);
        setRecipes([]);
        limit.current = 0;
        noMoreToLoad.current = false;
        loadRecipes();
    }

    function updateIntolerancesFilter(newIntolerances: string[]) {
        intolerancesFilterRef.current = newIntolerances;
        setIntolerancesFilter(newIntolerances);
        updatedURLFilterParams('intolerances', newIntolerances);
        setRecipes([]);
        limit.current = 0;
        noMoreToLoad.current = false;
        loadRecipes();
    }

    const hasFilters = ingredientsFilter.length > 0 || Boolean(categoryFilter) || Boolean(dietFilter) || intolerancesFilter.length > 0;

    return (
        <div className={"w-full bg-white"}>

            <Sheet side={"right"}
                   open={filtersOpen}
                   onOpenChange={setFiltersOpen}
                   className={"p-4 py-12 flex flex-col gap-8 max-w-full w-[500px] overflow-auto"}>
                <IconButton
                    className={"absolute top-4 right-4"}
                    onClick={() => setFiltersOpen(false)}>
                    <CloseIcon/>
                </IconButton>
                <Typography variant={"h4"} gutterBottom={true}>Filters</Typography>

                <CategoriesFilter value={categoryFilter}
                                  setValue={updateCategoriesFilter}/>
                {/*<DietsFilter value={dietFilter}*/}
                {/*             setValue={updateDietsFilter}/>*/}
                <IntolerancesFilter value={intolerancesFilter}
                                    setValue={updateIntolerancesFilter}
                                    intolerances={intolerances}/>
                <IngredientsSelect value={ingredientsFilter}
                                   setValue={updateIngredientsFilter}/>
            </Sheet>

            <div className={"mx-auto max-w-5xl my-8 p-4"}>
                <h1 className="typography-h4 ">Rezepte</h1>

                <Typography variant={"subtitle1"} className={"mt-1 text-text-secondary"}>
                    Entdecke eine Vielzahl von Rezepten für dich
                </Typography>

                <div className={"flex flex-row my-4 w-full items-end gap-4"}>

                    <Tabs
                        className={"flex-grow overflow-auto"}
                        innerClassName={"items-end"}
                        value={categoryFilter ?? "_all"}
                        onValueChange={(value) => updateCategoriesFilter(value === "_all" ? undefined : value)}
                    >
                        <Tab value={"_all"} innerClassName={"p-1 m-1 mx-2"}>All</Tab>
                        {categories.map(category => (
                            <Tab innerClassName={"p-1 m-1 mx-2"} key={category} value={category}>
                                {labels[category]}
                            </Tab>
                        ))}
                    </Tabs>

                    <div className={"flex items-center gap-4 h-fit"}>
                        <div className={"flex items-center gap-2"}>
                            {hasFilters && <Chip
                                className={"hover:bg-gray-200"}
                                onClick={() => {
                                    updateIngredientsFilter([]);
                                    updateCategoriesFilter(undefined);
                                    updatedURLFilterParams('ingredients', []);
                                    updatedURLFilterParams('categories', []);
                                    setRecipes([]);
                                    limit.current = 0;
                                    noMoreToLoad.current = false;
                                    loadRecipes();
                                }}
                                colorScheme={"grayLight"}
                                size={"small"}
                                icon={<CloseIcon size={"small"}/>}
                            >Filter löschen</Chip>}
                            <IconButton onClick={() => setFiltersOpen(true)}>
                                <TuneIcon size={"large"}/>
                            </IconButton>
                        </div>
                    </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                    {recipes.map((recipe) => (
                        <RecipePreviewCard key={recipe.id} recipe={recipe}/>
                    ))}
                </div>

                {loading && <div className="text-center my-32 min-h-full">
                    <CircularProgress size={"large"}/>
                </div>}

            </div>
        </div>

    );
}

function IngredientsSelect({ value, setValue }:
                               {
                                   value: string[],
                                   setValue: (value: string[]) => void
                               }) {

    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getIngredients().then(setIngredients).finally(() => setLoading(false));
    }, []);
    return <div>
        <div className="text-xs font-medium mb-2 text-slate-500 dark:text-slate-300 uppercase">Zutaten:</div>
        <MultiSelect value={!loading ? value : undefined}
                     modalPopover={true}
                     includeSelectAll={false}
                     className={"w-full bg-gray-100"}
                     renderValues={loading ? () => {
                         console.log("rendering loading");
                         return <CircularProgress size={"small"}/>;
                     } : undefined}
                     onValueChange={setValue}>
            {!loading && ingredients.map(ingredient => (
                <MultiSelectItem
                    key={ingredient.id}
                    value={ingredient.id}>
                    {ingredient.name}
                </MultiSelectItem>
            ))}
        </MultiSelect>
    </div>
}

const categories: RecipeCategory[] = [
    "breakfast", "lunch", "dinner", "snack", "dessert", "drink",
    "salad", "soup", "meal_prep", "lunch_to_go", "dressing"
];
const labels = {
    "breakfast": "Frühstück",
    "lunch": "Mittagessen",
    "dinner": "Abendessen",
    "snack": "Snack",
    "dessert": "Dessert",
    "drink": "Getränk",
    "salad": "Salat",
    "soup": "Suppe",
    "meal_prep": "Mahlzeitenvorbereitung",
    "lunch_to_go": "Lunch zum Mitnehmen",
    "dressing": "Dressing"
}

function CategoriesFilter({ value, setValue }: {
    value?: string,
    setValue: (value?: string) => void
}) {

    return (

        <div>
            <div className="text-xs font-medium mb-2 text-slate-500 dark:text-slate-300 uppercase">Kategorie:</div>
            <div className="flex flex-wrap gap-2">
                {categories.map(category => {
                    let selected = value === category;
                    return (
                        <Chip
                            key={category}
                            size={"small"}
                            // className={"border border-gray-200 " + (selected ? "bg-gray-100" : "")}
                            colorScheme={!selected ? "grayLighter" : {
                                color: "#EF8163",
                                text: "#ffffff"
                            }}
                            onClick={() => setValue(selected ? undefined : category)}
                        >
                            {labels[category]}
                        </Chip>
                    );
                })}
            </div>
        </div>
    );
}

// type Diet = "vegan" | "vegetarian" | "paleo" | "keto" | "pescatarian" | "omnivore";
const diets: Diet[] = ["vegan", "vegetarian", "paleo", "keto", "pescatarian", "omnivore"];
const dietLabels = {
    "vegan": "Vegan",
    "vegetarian": "Vegetarisch",
    "paleo": "Paleo",
    "keto": "Keto",
    "pescatarian": "Pescatarian",
    "omnivore": "Omnivore"
}

function DietsFilter({ value, setValue }: {
    value?: string,
    setValue: (value?: string) => void
}) {

    return (

        <div>
            <div className="text-xs font-medium mb-2 text-slate-500 dark:text-slate-300 uppercase">Diät:</div>
            <div className="flex flex-wrap gap-2">
                {diets.map(diet => {
                    let selected = value === diet;
                    return (
                        <Chip
                            key={diet}
                            size={"small"}
                            // className={"border border-gray-200 " + (selected ? "bg-gray-100" : "")}
                            colorScheme={!selected ? "grayLighter" : {
                                color: "#EF8163",
                                text: "#ffffff"
                            }}
                            onClick={() => setValue(selected ? undefined : diet)}
                        >
                            {dietLabels[diet]}
                        </Chip>
                    );
                })}
            </div>
        </div>
    );
}

function IntolerancesFilter({ value, setValue, intolerances }: {
    value: string[],
    setValue: (value: string[]) => void,
    intolerances: Intolerance[]
}) {

    return (

        <div>
            <div
                className="text-xs font-medium mb-2 text-slate-500 dark:text-slate-300 uppercase">Unverträglichkeiten:
            </div>
            <div className="flex flex-wrap gap-2">
                {intolerances.map(intolerance => {
                    let selected = value.includes(intolerance.id);
                    return (
                        <Chip
                            key={intolerance.id}
                            size={"small"}
                            // className={"border border-gray-200 " + (selected ? "bg-gray-100" : "")}
                            colorScheme={!selected ? "grayLighter" : {
                                color: "#EF8163",
                                text: "#ffffff"
                            }}
                            onClick={() => setValue(selected ? value.filter(v => v !== intolerance.id) : [...value, intolerance.id])}
                        >
                            {intolerance.name}
                        </Chip>
                    );
                })}
            </div>
        </div>
    );
}



