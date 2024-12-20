import { useCallback, useRef } from "react";

export function useDebounceCallback<T extends (...args: any[]) => any>(
    callback?: T,
    delay?: number
): T {
    const timeoutRef = useRef<number | null>(null);

    const debouncedCallback = useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current !== null) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            callback?.(...args);
        }, delay ?? 200);
    }, [callback, delay]);

    return debouncedCallback as T;
}
