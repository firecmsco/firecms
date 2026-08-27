import React from "react";

/**
 * Prefetch after the page has loaded, never during it.
 *
 * An idle callback scheduled at module evaluation time fires in the gaps between
 * the tasks of the initial load — which is exactly when the critical chunks are
 * still in flight. With a dozen route components each queueing one, the
 * background prefetch was competing with the render path for connections and
 * bandwidth. Waiting for the load event costs the prefetch nothing that matters:
 * it exists to be ready before a navigation, not before first paint.
 */
function schedulePrefetch(load: () => void) {
    const whenIdle = () => {
        if ("requestIdleCallback" in window) {
            (window as any).requestIdleCallback(load);
        } else {
            setTimeout(load, 500);
        }
    };

    if (document.readyState === "complete") {
        whenIdle();
    } else {
        window.addEventListener("load", whenIdle, { once: true });
    }
}

/**
 * Returns a React.lazy component that is also preloaded in the background, once
 * the page has finished loading.
 * This ensures that chunks are split, but fetched before they are actually needed.
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
        schedulePrefetch(load);
    }

    return React.lazy(load);
}
