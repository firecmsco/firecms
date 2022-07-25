import { Entity } from "../../models";
import { useEffect, useMemo, useState } from "react";

export interface DataOrderProps<M extends { [Key: string]: any }> {
    data: Entity<M>[];
    entitiesDisplayedFirst?: Entity<M>[];
}

/**
 * This hook is used to have some entities at the beginning of data.
 * @param path
 * @param entitiesDisplayedFirst
 * @category Hooks and utilities
 */
export function useDataOrder<M>(
    {
        data,
        entitiesDisplayedFirst
    }: DataOrderProps<M>): Entity<M>[] {

    const initialEntities = useMemo(() => entitiesDisplayedFirst ? entitiesDisplayedFirst.filter(e => !!e.values) : [], [entitiesDisplayedFirst]);
    const [result, setResult] = useState<Entity<M>[]>(initialEntities);

    useEffect(() => {
        if (!initialEntities) {
            setResult(data);
        } else {
            const displayedFirstId = new Set(initialEntities.map((e) => e.id));
            setResult([...initialEntities, ...data.filter((e) => !displayedFirstId.has(e.id))]);
        }
    }, [data, initialEntities]);

    return result;

}
