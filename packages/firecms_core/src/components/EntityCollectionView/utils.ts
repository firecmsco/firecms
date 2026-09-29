import { getLocalStorageJSON, setLocalStorageItem } from "../../util/local_storage";

export function addRecentId(collectionId: string, id: string) {
    const recentIds = getRecentIds(collectionId);
    const newRecentIds = [id, ...recentIds.filter(i => i !== id)];
    if (newRecentIds.length > 5) {
        newRecentIds.pop();
    }
    saveSearchedIdsLocally(collectionId, newRecentIds);
    return newRecentIds;
}

export function saveSearchedIdsLocally(collectionId: string, ids: string[]) {
    setLocalStorageItem("recent_id_searches::" + collectionId, JSON.stringify(ids));
}

export function getRecentIds(collectionId: string): string[] {
    return getLocalStorageJSON("recent_id_searches::" + collectionId, []);
}
