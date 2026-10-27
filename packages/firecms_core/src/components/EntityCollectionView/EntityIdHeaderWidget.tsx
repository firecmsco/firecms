import React, { useCallback, useRef } from "react";
import { Button, cls, focusedDisabled, IconButton, KeyboardTabIcon, Popover, SearchIcon, Tooltip } from "@firecms/ui";
import { EntityCollection, EntityReference } from "../../types";
import { navigateToEntity } from "../../util/navigation_utils";
import { ReferencePreview } from "../../preview";
import { useNavigationController } from "../../hooks/useNavigationController";
import { useSideEntityController } from "../../hooks/useSideEntityController";
import { useTranslation } from "../../hooks/useTranslation";
import { useDataSource } from "../../hooks/data/useDataSource";
import { addRecentId, getRecentIds, removeRecentIds } from "./utils";

const DEFAULT_ENTITY_OPEN_MODE: "side_panel" | "full_screen" = "side_panel";

/**
 * "Find by id" in the header of a collection's id column, listing the ids opened in it lately.
 */
export function EntityIdHeaderWidget({
    collection,
    path,
    pathSegments,
    fullIdPath
}: {
    collection: EntityCollection,
    path: string,
    /** `path` split at its real segment boundaries, when the caller knows them. */
    pathSegments?: string[],
    fullIdPath: string
}) {

    const navigation = useNavigationController();
    const dataSource = useDataSource(collection);
    const [openPopup, setOpenPopup] = React.useState(false);
    const [searchString, setSearchString] = React.useState("");
    // The recent ids are kept per full path rather than per collection: a subcollection has
    // the same id under every parent, and an id found under one parent does not exist under
    // the others. Only the ones known to exist are listed.
    const [recentIds, setRecentIds] = React.useState<string[]>([]);
    const latestCheck = useRef(0);
    const sideEntityController = useSideEntityController();
    const { t } = useTranslation();

    // Resolved as useEntityFetch resolves them, so the check reads what the preview shows.
    const resolvedPath = navigation.resolveIdsFrom(path, pathSegments);
    const resolvedPathSegments = pathSegments
        ? (navigation.resolveSegmentsFrom?.(pathSegments) ?? pathSegments)
        : undefined;

    /** Whether the entity exists, or `undefined` when that could not be told. */
    const entityExists = useCallback(async (entityId: string): Promise<boolean | undefined> => {
        try {
            const entity = await dataSource.fetchEntity({
                path: resolvedPath,
                pathSegments: resolvedPathSegments,
                entityId,
                collection
            });
            return Boolean(entity?.values);
        } catch (e) {
            return undefined;
        }
    }, [dataSource, resolvedPath, resolvedPathSegments, collection]);

    // A recent id that no longer exists would be fetched and shown as "not found" on every
    // opening, so it is forgotten. One that could not be checked is kept for next time.
    const refreshRecentIds = () => {
        const ids = getRecentIds(fullIdPath);
        const check = ++latestCheck.current;
        Promise.all(ids.map(entityExists)).then((results) => {
            if (check !== latestCheck.current) return;
            const missing = ids.filter((_, i) => results[i] === false);
            if (missing.length > 0)
                removeRecentIds(fullIdPath, missing);
            setRecentIds(ids.filter((_, i) => results[i] === true));
        });
    };

    const openEntityMode = collection?.openEntityMode ?? DEFAULT_ENTITY_OPEN_MODE;

    return (
        <Tooltip title={!openPopup ? t("find_by_id") : undefined} asChild={false}>
            <Popover
                open={openPopup}
                onOpenChange={(open) => {
                    // read on each opening: rows opened since the last one are recent too
                    if (open) refreshRecentIds();
                    setOpenPopup(open);
                }}
                sideOffset={0}
                align={"start"}
                alignOffset={-117}
                trigger={
                    <IconButton size={"small"}>
                        <SearchIcon size={"small"} />
                    </IconButton>
                }>
                <div
                    className={cls("my-2 rounded-lg bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-white")}>
                    <form noValidate={true}
                        onSubmit={(e) => {
                            e.preventDefault();
                            const entityId = searchString.trim();
                            // Enter submits even while the button is disabled, and an empty
                            // id would open a new entity instead
                            if (!entityId) return;
                            setOpenPopup(false);
                            // remembered only once found, or every opening would fetch it again
                            entityExists(entityId).then((exists) => {
                                if (exists) addRecentId(fullIdPath, entityId);
                            });
                            navigateToEntity({
                                openEntityMode,
                                collection,
                                entityId,
                                path,
                                pathSegments,
                                fullIdPath,
                                sideEntityController,
                                navigation
                            })
                        }}
                        className={"w-96 max-w-full"}>

                        <div className="flex p-2 w-full gap-2">
                            <input
                                autoFocus={openPopup}
                                placeholder={t("find_entity_by_id")}
                                // size={"small"}
                                onChange={(e) => {
                                    setSearchString(e.target.value);
                                }}
                                value={searchString}
                                className={"rounded-lg bg-white dark:bg-surface-800 flex-grow bg-transparent outline-none p-2 " + focusedDisabled} />
                            <Button variant={"text"}
                                disabled={!(searchString.trim())}
                                type={"submit"}
                            ><KeyboardTabIcon /></Button>
                        </div>
                    </form>
                    {recentIds && recentIds.length > 0 && <div className="flex flex-col gap-2 p-2">
                        {recentIds.map(id => (
                            <ReferencePreview reference={new EntityReference(id, path, undefined, pathSegments)}
                                key={id}
                                hover={true}
                                onClick={() => {
                                    setOpenPopup(false);
                                    navigateToEntity({
                                        openEntityMode,
                                        collection,
                                        entityId: id,
                                        path,
                                        pathSegments,
                                        fullIdPath,
                                        sideEntityController,
                                        navigation
                                    })
                                }}
                                includeEntityLink={false}
                                size={"small"} />
                        ))}
                    </div>}
                </div>
            </Popover>

        </Tooltip>
    );
}
