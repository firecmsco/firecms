import React, { useMemo } from "react";
import { cls, Typography } from "@firecms/ui";
import { useNavigationController } from "../../hooks/useNavigationController";
import { getNavigationEntriesFromPath } from "../../util/navigation_from_path";
import { CollectionCountBadge } from "./CollectionCountBadge";

/**
 * A name and its entity count, under what is above it: breadcrumbs folded on two lines
 * for where a row of them would not fit.
 */
export function PathTitle({
    parents,
    name,
    count,
    className
}: {
    parents: string[],
    name: string,
    /** `undefined` shows no count, `null` a loading one. */
    count: number | null | undefined,
    className?: string
}) {
    return <div className={cls("flex flex-col", className)}>
        {parents.length > 0 && <Typography variant={"caption"} color={"secondary"} noWrap>
            {parents.join(" / ")}
        </Typography>}
        <div className="flex flex-row items-center gap-2 min-w-0">
            <Typography variant={"body2"} noWrap className={"font-medium"}>
                {name}
            </Typography>
            <CollectionCountBadge count={count}/>
        </div>
    </div>;
}

/**
 * A collection's name and entity count, under the collections and entities above it,
 * the same things the app bar's breadcrumbs show. A side panel covers those, so it
 * shows a subcollection's in its own top bar.
 */
export function CollectionPathTitle({
    path,
    name,
    count
}: {
    /** The escaped chain, as in `fullIdPath`. */
    path: string,
    name: string,
    /** `undefined` shows no count, `null` a loading one. */
    count: number | null | undefined
}) {
    const navigation = useNavigationController();
    const parents = useMemo(() => getNavigationEntriesFromPath({
        path,
        collections: navigation.collections ?? []
    })
        .slice(0, -1)
        .map(entry => entry.type === "entity"
            ? entry.entityId
            : entry.type === "collection" ? entry.collection.name : entry.view.name),
    [path, navigation.collections]);

    // it keeps its width, up to the cap, and the tabs next to it scroll instead
    return <PathTitle parents={parents}
                      name={name}
                      count={count}
                      className={"shrink-0 mx-2 max-w-[140px] sm:max-w-[240px] lg:max-w-[320px]"}/>;
}
