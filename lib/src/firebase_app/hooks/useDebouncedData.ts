import React from "react";

/**
 * Hack to prevent data updates for incomplete callbacks from Firestore
 * triggers
 * @param data
 * @param timeoutMs
 */
export function useDebouncedData<T>(data: T[], timeoutMs = 3000) {

    const [deferredData, setDeferredData] = React.useState(data);
    const dataLength = React.useRef(deferredData.length);
    const pendingUpdate = React.useRef(false);

    React.useEffect(() => {

        const performUpdate = () => {
            setDeferredData(data);
            dataLength.current = data.length;
            pendingUpdate.current = false;
        };

        pendingUpdate.current = true;

        const immediateUpdate = data.length >= dataLength.current;
        const handler = setTimeout(performUpdate, immediateUpdate ? 0 : timeoutMs);

        return () => {
            clearTimeout(handler);
            if (pendingUpdate.current && immediateUpdate)
                performUpdate();
        };
    }, [data, timeoutMs]);

    return deferredData;
}
