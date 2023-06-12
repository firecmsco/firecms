import React from "react";

export function useDebounce<T>(value: T, callback: () => void, immediate: boolean, timeoutMs = 300) {

    const pendingUpdate = React.useRef(false);
    const performUpdate = () => {
        callback();
        pendingUpdate.current = false;
    };

    const handlerRef = React.useRef<number | undefined>(undefined);

    React.useEffect(
        () => {
            pendingUpdate.current = true;
            clearTimeout(handlerRef.current);
            handlerRef.current = setTimeout(performUpdate, timeoutMs) as any;
            return () => {
                if (immediate)
                    performUpdate();
            };
        },
        [immediate, value]
    );
}
