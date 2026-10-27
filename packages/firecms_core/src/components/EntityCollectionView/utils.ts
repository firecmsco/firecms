import { getLocalStorageJSON, setLocalStorageItem } from "../../util/local_storage";

export function addRecentId(key: string, id: string) {
    const recentIds = getRecentIds(key);
    const newRecentIds = [id, ...recentIds.filter(i => i !== id)];
    if (newRecentIds.length > 5) {
        newRecentIds.pop();
    }
    saveSearchedIdsLocally(key, newRecentIds);
    return newRecentIds;
}

export function saveSearchedIdsLocally(key: string, ids: string[]) {
    setLocalStorageItem("recent_id_searches::" + key, JSON.stringify(ids));
}

export function getRecentIds(key: string): string[] {
    return getLocalStorageJSON("recent_id_searches::" + key, []);
}
