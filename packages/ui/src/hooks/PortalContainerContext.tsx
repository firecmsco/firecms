"use client";
import React, { createContext, useContext } from "react";

export interface PortalContainerContextType {
    container: HTMLElement | null;
}

const PortalContainerContext = createContext<PortalContainerContextType | undefined>(undefined);

export interface PortalContainerProviderProps {
    container: HTMLElement | null;
    children: React.ReactNode;
}

/**
 * Provider component that sets the portal container for all descendants.
 * This can be used at any level of the tree to specify where portals should be attached.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 *
 * <div ref={containerRef}>
 *   <PortalContainerProvider container={containerRef.current}>
 *     <YourComponents />
 *   </PortalContainerProvider>
 * </div>
 * ```
 */
export function PortalContainerProvider({ container, children }: PortalContainerProviderProps) {
    return (
        <PortalContainerContext.Provider value={{ container }}>
            {children}
        </PortalContainerContext.Provider>
    );
}

/**
 * Hook to access the portal container from context.
 * Returns null if no provider is found in the tree.
 *
 * @returns The portal container element or null
 */
export function usePortalContainer(): HTMLElement | null {
    const context = useContext(PortalContainerContext);
    return context?.container ?? null;
}

