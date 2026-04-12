import { useContext, useEffect } from "react";
import type { StudioBridge } from "./useStudioBridge";
import { StudioBridgeRegistryContext } from "./useStudioBridge";

/**
 * Registers a value into the self-assembling Studio bridge.
 *
 * Each controller (collectionRegistry, sideEntity, url, navigation, breadcrumbs)
 * calls this hook on mount to inject its real implementation into the bridge.
 * On unmount the slice is automatically removed, reverting to the noop default.
 *
 * Usage:
 * ```tsx
 * function SomeProvider({ children }) {
 *     const controller = useBuildSomeController();
 *     useBridgeRegistration("sideEntityController", controller);
 *     return <SomeContext.Provider value={controller}>{children}</SomeContext.Provider>;
 * }
 * ```
 */
export function useBridgeRegistration<K extends keyof StudioBridge>(
    key: K,
    value: StudioBridge[K]
): void {
    const registry = useContext(StudioBridgeRegistryContext);

    useEffect(() => {
        if (!registry) return;
        registry.register(key, value);
        return () => registry.unregister(key);
    }, [registry, key, value]);
}
