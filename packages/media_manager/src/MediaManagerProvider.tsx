import React, { createContext, PropsWithChildren, useContext } from "react";
import { MediaManagerController } from "./types";

const MediaManagerContext = createContext<MediaManagerController | undefined>(undefined);

/**
 * Hook to access the MediaManagerController from context.
 * Must be used within a MediaManagerProvider.
 */
export function useMediaManager(): MediaManagerController {
    const context = useContext(MediaManagerContext);
    if (!context) {
        throw new Error("useMediaManager must be used within a MediaManagerProvider");
    }
    return context;
}

export interface MediaManagerProviderProps {
    controller: MediaManagerController;
}

/**
 * Provider component that makes the MediaManagerController available to all children.
 */
export function MediaManagerProvider({
    controller,
    children
}: PropsWithChildren<MediaManagerProviderProps>) {
    return (
        <MediaManagerContext.Provider value={controller}>
            {children}
        </MediaManagerContext.Provider>
    );
}
