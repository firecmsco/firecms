import React from "react";

export function useDebounce<T>(value: T, doUpdate: () => void, timeoutMs = 300) {
    React.useEffect(
        () => {
            const handler = setTimeout(doUpdate, timeoutMs);
            return () => {
                clearTimeout(handler);
            };
        },
        [value]
    );
}
