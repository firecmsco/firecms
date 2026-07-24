import { useCallback, useEffect, useRef } from "react";

/**
 * Returns a debounced version of the provided callback. The returned function
 * keeps the same signature as the input callback; each invocation resets the
 * timer, so the wrapped callback only runs once calls stop for `delay` ms.
 *
 * Unlike {@link useDebounceValue}, which debounces a *value*, this debounces a
 * *function call* — useful for search inputs, autosave, resize handlers, etc.
 *
 * @param callback the function to debounce. May be undefined.
 * @param delay debounce delay in milliseconds. Defaults to 200ms.
 * @group Hooks
 */
export function useDebounceCallback<T extends (...args: any[]) => unknown>(
    callback?: T,
    delay?: number
): T {
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep the latest callback without recreating the debounced function.
    const callbackRef = useRef(callback);
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Clear any pending timer on unmount.
    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const debouncedCallback = useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current?.(...args);
        }, delay ?? 200);
    }, [delay]);

    return debouncedCallback as T;
}
