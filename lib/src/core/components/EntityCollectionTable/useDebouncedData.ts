import React from "react";
import equal from "react-fast-compare";

/**
 * Hack to prevent data updates for incomplete callbacks from Firestore
 * triggers.
 * If any deps change, the update is immediate
 * @param data
 * @param deps
 * @param timeoutMs
 */
export function useDebouncedData<T>(data: T[], deps: any, timeoutMs = 5000) {

    const [deferredData, setDeferredData] = React.useState(data);
    const dataLength = React.useRef(deferredData.length ?? 0);
    const pendingUpdate = React.useRef(false);
    const currentDeps = React.useRef(deps);

    const haveDepsChanged = !equal(currentDeps.current, deps);
    const immediateUpdate = data.length >= dataLength.current || haveDepsChanged;

    React.useEffect(() => {

        const performUpdate = () => {
            if (!equal(deferredData, data)) {
                currentDeps.current = deps;
                dataLength.current = data.length;
                setDeferredData(data);
            }
            pendingUpdate.current = false;
        };

        pendingUpdate.current = true;

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
    }, [data, timeoutMs, deps, immediateUpdate]);

    return immediateUpdate ? data : deferredData;
}
