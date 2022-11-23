import { Entity } from "../../types";
import { useEffect, useMemo, useState } from "react";

export interface DataOrderProps<M extends Record<string, any>> {
    data: Entity<M>[];
    entitiesDisplayedFirst?: Entity<M>[];
}

function useDataOrderInternal<M>(entitiesDisplayedFirst: Entity<M>[], data: Entity<M>[]) {
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
    // HACK for performance
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDataOrderInternal(entitiesDisplayedFirst, data);

}
