import React from "react";

export function useDebouncedCallback<T>(value: T, callback: () => void, immediate: boolean, timeoutMs = 300) {

    const pendingUpdate = React.useRef(false);

    const callbackRef = React.useRef(callback);
    React.useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const performUpdate = React.useCallback(() => {
        callbackRef.current();
        pendingUpdate.current = false;
    }, []);

    const handlerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    React.useEffect(
        () => {
            if (immediate) {
                clearTimeout(handlerRef.current);
                if (pendingUpdate.current) {
                    performUpdate();
                }
                return;
            }

            pendingUpdate.current = true;
            clearTimeout(handlerRef.current);
            handlerRef.current = setTimeout(performUpdate, timeoutMs);
            return () => {
                if (immediate)
                    performUpdate();
            };
        },
        [immediate, value, performUpdate, timeoutMs]
    );
}
