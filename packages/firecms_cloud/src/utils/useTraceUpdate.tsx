import { useEffect, useRef } from "react";

function printChanged(props: any, prev: any, path = "", depth = 0) {
    if (depth > 10) {
        return;
    }
    if (props && prev && typeof props === "object" && typeof prev === "object") {
        Object.keys(props).forEach((key) => {
            printChanged(props[key], prev[key], path + "." + key, depth + 1);
        });
    } else if (props !== prev) {
        console.log("Changed props:", path);
    }

}

export function useTraceUpdate(props: any) {
    const prev = useRef(props);
    useEffect(() => {
        printChanged(props, prev.current, "");
        prev.current = props;
    });
}
