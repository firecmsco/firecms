import React, { createContext, useCallback, useContext, useState } from "react";
import { CollectionOperation } from "../../api/generateCollectionApi";

export interface AIModifiedPathsContextType {
    /** Set of paths that were modified by AI */
    modifiedPaths: Set<string>;
    /** Add paths from operations */
    addModifiedPaths: (operations: CollectionOperation[]) => void;
    /** Clear a specific path (when user edits that field) */
    clearPath: (path: string) => void;
    /** Clear all paths (on save or cancel) */
    clearAllPaths: () => void;
    /** Check if a path is modified */
    isPathModified: (path: string) => boolean;
}

const AIModifiedPathsContext = createContext<AIModifiedPathsContextType | null>(null);

export function AIModifiedPathsProvider({ children }: { children: React.ReactNode }) {
    const [modifiedPaths, setModifiedPaths] = useState<Set<string>>(new Set());

    const addModifiedPaths = useCallback((operations: CollectionOperation[]) => {
        setModifiedPaths(prev => {
            const newSet = new Set(prev);
            operations.forEach(op => {
                // Add the path and all parent paths for nested modifications
                newSet.add(op.path);
                // For properties modifications, also mark the property itself
                // e.g., "properties.email.description" -> also adds "properties.email"
                const parts = op.path.split(".");
                if (parts[0] === "properties" && parts.length >= 2) {
                    newSet.add(`properties.${parts[1]}`);
                }
            });
            return newSet;
        });
    }, []);

    const clearPath = useCallback((path: string) => {
        setModifiedPaths(prev => {
            const newSet = new Set(prev);
            // Remove exact path and any child paths
            for (const p of newSet) {
                if (p === path || p.startsWith(path + ".")) {
                    newSet.delete(p);
                }
            }
            return newSet;
        });
    }, []);

    const clearAllPaths = useCallback(() => {
        setModifiedPaths(new Set());
    }, []);

    const isPathModified = useCallback((path: string): boolean => {
        // Check if this exact path or any parent path is modified
        if (modifiedPaths.has(path)) return true;
        // Check if any child paths are modified
        for (const p of modifiedPaths) {
            if (p.startsWith(path + ".")) return true;
        }
        return false;
    }, [modifiedPaths]);

    return (
        <AIModifiedPathsContext.Provider value={{
            modifiedPaths,
            addModifiedPaths,
            clearPath,
            clearAllPaths,
            isPathModified
        }}>
            {children}
        </AIModifiedPathsContext.Provider>
    );
}

export function useAIModifiedPaths(): AIModifiedPathsContextType | null {
    return useContext(AIModifiedPathsContext);
}
