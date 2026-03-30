import { useEffect, useRef } from "react";

function printChanged(props: Record<string, unknown>, prev: Record<string, unknown>, path = "", depth = 0) {
    if (depth > 10) {
        return;
    }
    if (props && prev && typeof props === "object" && typeof prev === "object") {
        Object.keys(props).forEach((key) => {
            printChanged(props[key] as Record<string, unknown>, prev[key] as Record<string, unknown>, path + "." + key, depth + 1);
        });
    } else if (props !== prev) {
        console.log("Changed props:", path);
    }

}

export function useTraceUpdate(props: Record<string, unknown>) {
    const prev = useRef(props);
    useEffect(() => {
        printChanged(props, prev.current, "");
        prev.current = props;
    });
}
