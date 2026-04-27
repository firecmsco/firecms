import React from "react";

/**
 * Returns a React.lazy component that is also preloaded immediately using
 * requestIdleCallback or setTimeout.
 * This ensures that chunks are split, but fetched in the background before they are actually needed.
 */
export function lazyEager<T extends React.ComponentType<any>>(
    factory: () => Promise<any>,
    exportName: string = "default"
): React.LazyExoticComponent<T> {
    let promise: Promise<any> | null = null;

    const load = () => {
        if (!promise) {
            promise = factory().then((module) => {
                const component = module[exportName] || module.default || module;
                return { default: component };
            });
        }
        return promise;
    };

    if (typeof window !== "undefined") {
        if ("requestIdleCallback" in window) {
            (window as any).requestIdleCallback(load);
        } else {
            setTimeout(load, 500);
        }
    }

    return React.lazy(load);
}
