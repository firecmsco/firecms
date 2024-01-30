import { useEffect, useRef } from "react";

function printChanged(props: any, prev: any, path = "", depth = 0, maxDepth: number) {
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
        printChanged(props, prev.current, "", 0, maxDepth);
        prev.current = props;
    });
}
