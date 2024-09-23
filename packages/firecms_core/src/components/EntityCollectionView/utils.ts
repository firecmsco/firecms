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
    localStorage.setItem("recent_id_searches::" + collectionId, JSON.stringify(ids));
}

export function getRecentIds(collectionId: string): string[] {
    const stored = localStorage.getItem("recent_id_searches::" + collectionId);
    if (!stored) return [];
    return JSON.parse(stored);
}
