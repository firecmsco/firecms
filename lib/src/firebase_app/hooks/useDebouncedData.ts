import React from "react";
import equal from "react-fast-compare";

/**
 * Hack to prevent data updates for incomplete callbacks from Firestore
 * triggers
 * @param data
 * @param filters
 * @param timeoutMs
 */
export function useDebouncedData<T>(data: T[], filters: any, timeoutMs = 5000) {

    const [deferredData, setDeferredData] = React.useState(data);
    const dataLength = React.useRef(deferredData.length ?? 0);
    const pendingUpdate = React.useRef(false);
    const currentFilters = React.useRef(filters);

    const immediateUpdate = data.length >= dataLength.current || !equal(currentFilters.current, filters);

    React.useEffect(() => {

        const performUpdate = () => {
            setDeferredData(data);
            dataLength.current = data.length;
            pendingUpdate.current = false;
        };

        pendingUpdate.current = true;
        currentFilters.current = filters;

        let handler: any;
        if (immediateUpdate)
            performUpdate()
        else
            handler = setTimeout(performUpdate, timeoutMs);

        return () => {
            clearTimeout(handler);
            if (pendingUpdate.current && immediateUpdate)
                performUpdate();
        };
    }, [data, timeoutMs, filters]);
    console.log("useDebouncedData", immediateUpdate, data);

    return immediateUpdate ? data : deferredData;
}
