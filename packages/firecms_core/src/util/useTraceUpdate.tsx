import { useEffect, useRef } from "react";

export function printChanged(props: any, prev: any, path: string | undefined = "", depth: number | undefined = 0, maxDepth: number | undefined = 10) {
    if (depth > maxDepth) {
        return;
    }
    if (props && prev && typeof props === "object" && typeof prev === "object") {
        Object.keys(props).forEach((key) => {
            printChanged(props[key], prev[key], path + "." + key, depth + 1, maxDepth);
        });
    } else if (props !== prev) {
        console.log("Changed props:", path);
    }

}

export function useTraceUpdate(props: any, maxDepth = 3) {
    const prev = useRef(props);
    useEffect(() => {
        console.log("Changed props:");
        printChanged(props, prev.current, "", 0, maxDepth);
        prev.current = props;
    });
}
