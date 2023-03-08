import { Entity } from "../../types";

export interface DataOrderProps<M extends Record<string, any>> {
    data: Entity<M>[];
    entitiesDisplayedFirst?: Entity<M>[];
}

/**
 * This hook is used to have some entities at the beginning of data.
 * @param path
 * @param entitiesDisplayedFirst
 * @category Hooks and utilities
 */
export function useDataOrder<M extends Record<string, any>>(
    {
        data,
        entitiesDisplayedFirst
    }: DataOrderProps<M>): Entity<M>[] {

    if (!entitiesDisplayedFirst)
        return data;

    const displayedFirstId = new Set(entitiesDisplayedFirst.map((e) => e.id));
    return [...entitiesDisplayedFirst, ...data.filter((e) => !displayedFirstId.has(e.id))];

}
