import type { AppView, EntityCollection, RebasePlugin, NavigationGroupMapping } from "@rebasepro/types";
;
import { getSubcollections } from "@rebasepro/common";
import { deepEqual as equal } from "fast-equals";

export const NAVIGATION_DEFAULT_GROUP_NAME = "Views";
export const NAVIGATION_ADMIN_GROUP_NAME = "Admin";

export function getGroup(collectionOrView: EntityCollection<any, any> | AppView) {
    const trimmed = collectionOrView.group?.trim();
    if (!trimmed || trimmed === "") {
        return NAVIGATION_DEFAULT_GROUP_NAME;
    }
    return trimmed ?? NAVIGATION_DEFAULT_GROUP_NAME;
}

export function computeNavigationGroups({
    navigationGroupMappings,
    collections,
    views,
    plugins
}: {
    navigationGroupMappings?: NavigationGroupMapping[],
    collections?: EntityCollection[],
    views?: AppView[],
    plugins?: RebasePlugin[]
}): NavigationGroupMapping[] {

    // Deep clone the input groups upfront to avoid mutating the caller's data
    let result = navigationGroupMappings
        ? navigationGroupMappings.map(g => ({ name: g.name, entries: [...g.entries] }))
        : navigationGroupMappings;

    // Merge plugin navigation entries
    if (plugins) {
        result = plugins.reduce((acc, plugin) => {
            if (plugin.hooks?.navigationEntries) {
                plugin.hooks.navigationEntries.forEach((entry) => {
                    const {
                        name,
                        entries
                    } = entry;
                    const existingGroup = acc.find(g => g.name === name);
                    if (existingGroup) {
                        existingGroup.entries.push(...entries);
                    } else {
                        acc.push({
                            name,
                            entries: [...entries]
                        });
                    }
                });

            }
            return acc;
        }, result ?? []);
    }

    // Track all entries that are already assigned to groups
    const assignedEntries = new Set<string>();
    if (result) {
        result.forEach(group => {
            group.entries.forEach(entry => assignedEntries.add(entry));
        });
    }

    // Find collections and views that are NOT in any persisted group
    const unassignedGroupMap: Record<string, string[]> = {};

    // Check collections
    (collections ?? []).forEach(collection => {
        const entry = collection.slug;
        if (!assignedEntries.has(entry)) {
            const groupName = getGroup(collection);
            if (!unassignedGroupMap[groupName]) unassignedGroupMap[groupName] = [];
            unassignedGroupMap[groupName].push(entry);
        }
    });

    // Check views
    (views ?? []).forEach(view => {
        const entry = Array.isArray(view.slug) ? view.slug[0] : view.slug;
        if (!assignedEntries.has(entry)) {
            const groupName = getGroup(view);
            if (!unassignedGroupMap[groupName]) unassignedGroupMap[groupName] = [];
            unassignedGroupMap[groupName].push(entry);
        }
    });

    // Merge unassigned entries into existing groups or create new groups
    Object.entries(unassignedGroupMap).forEach(([groupName, entries]) => {
        if (result) {
            const existingGroup = result.find(g => g.name === groupName);
            if (existingGroup) {
                existingGroup.entries.push(...entries);
            } else {
                result.push({
                    name: groupName,
                    entries
                });
            }
        }
    });

    if (!result) {
        // No persisted data at all - create from scratch
        result = [];
        const groupMap: Record<string, string[]> = {};

        // Add collections
        (collections ?? []).forEach(collection => {
            const name = getGroup(collection);
            const entry = collection.slug;
            if (!groupMap[name]) groupMap[name] = [];
            groupMap[name].push(entry);
        });

        // Add views
        (views ?? []).forEach(view => {
            const name = getGroup(view);
            const entry = Array.isArray(view.slug) ? view.slug[0] : view.slug;
            if (!groupMap[name]) groupMap[name] = [];
            groupMap[name].push(entry);
        });

        // Convert groupMap to result array
        result = Object.entries(groupMap).map(([name, entries]) => ({
            name,
            entries
        }));
    }

    // Remove duplicates in entries
    result.forEach(group => {
        group.entries = [...new Set(group.entries)];
    });

    return result;
}

export function areCollectionListsEqual(a: EntityCollection[], b: EntityCollection[], visitedSlugs: string[] = []) {
    if (a.length !== b.length) {
        return false;
    }
    const aCopy = [...a];
    const bCopy = [...b];
    const aSorted = aCopy.sort((x, y) => x.slug.localeCompare(y.slug));
    const bSorted = bCopy.sort((x, y) => x.slug.localeCompare(y.slug));
    return aSorted.every((value, index) => areCollectionsEqual(value, bSorted[index], visitedSlugs));
}

export function areCollectionsEqual(a: EntityCollection, b: EntityCollection, visitedSlugs: string[] = []) {
    if (a.slug !== b.slug) {
        return false;
    }
    if (visitedSlugs.includes(a.slug)) {
        return true;
    }
    const newVisited = [...visitedSlugs, a.slug];

    const {
        subcollections: subcollectionsA,
        ...restA
    } = a;
    const {
        subcollections: subcollectionsB,
        ...restB
    } = b;
    if (!areCollectionListsEqual(getSubcollections(a), getSubcollections(b), newVisited)) {
        return false;
    }
    const restAWithoutFunctions = Object.fromEntries(
        Object.entries(restA).filter(([_, v]) => typeof v !== 'function')
    );
    const restBWithoutFunctions = Object.fromEntries(
        Object.entries(restB).filter(([_, v]) => typeof v !== 'function')
    );
    return equal(restAWithoutFunctions, restBWithoutFunctions);
}
