import React from "react";

export function useDebounce<T>(value: T, callback: () => void, timeoutMs = 300) {

    const pendingUpdate = React.useRef(false);
    const performUpdate = React.useCallback(() => {
        callback();
        pendingUpdate.current = false;
    }, [callback]);

    React.useEffect(
        () => {
            pendingUpdate.current = true;
            const handler = setTimeout(performUpdate, timeoutMs);
            return () => {
                clearTimeout(handler);
                if (pendingUpdate.current)
                    performUpdate();
            };
        },
        [value]
    );
}
