import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY_PREFIX = "firecms-collapsed-groups";

/**
 * Custom hook for managing collapsed/expanded state of navigation groups
 * with localStorage persistence. Automatically cleans up stale group entries
 * when groups are removed from the navigation.
 * 
 * @param groupNames - Array of group names to track
 * @param namespace - Namespace for localStorage key (e.g., "home", "drawer") to allow independent state
 */
export function useCollapsedGroups(groupNames: string[], namespace: string = "default") {
    const storageKey = `${STORAGE_KEY_PREFIX}-${namespace}`;

    // Load collapsed groups from localStorage on mount
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    });

    // Save to localStorage whenever collapsedGroups changes
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(collapsedGroups));
        } catch {
            // Silently fail if localStorage is not available
        }
    }, [collapsedGroups, storageKey]);

    // Clean up collapsed groups state when groups change - remove entries for groups that no longer exist
    useEffect(() => {
        // Only clean up if we have actual groups loaded (avoid cleaning up during initial load)
        if (groupNames.length === 0) return;

        const currentGroupNames = new Set(groupNames);

        setCollapsedGroups(prev => {
            const cleaned = Object.fromEntries(
                Object.entries(prev).filter(([groupName]) => currentGroupNames.has(groupName))
            );

            // Only update if something actually changed
            const prevKeys = Object.keys(prev);
            const cleanedKeys = Object.keys(cleaned);

            if (prevKeys.length === cleanedKeys.length && prevKeys.every(key => cleanedKeys.includes(key))) {
                return prev;
            }

            return cleaned;
        });
    }, [groupNames]);

    const isGroupCollapsed = useCallback((name: string) => {
        return !!collapsedGroups[name];
    }, [collapsedGroups]);

    const toggleGroupCollapsed = useCallback((name: string) => {
        setCollapsedGroups(prev => ({ ...prev, [name]: !prev[name] }));
    }, []);

    return {
        isGroupCollapsed,
        toggleGroupCollapsed
    };
}

