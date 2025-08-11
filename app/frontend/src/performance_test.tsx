import React, { Profiler } from "react";
import { createRoot } from "react-dom/client";
import "./index.css"

import { App } from "./FirestoreApp/App";

const dod = () => {
    // @ts-ignore
    const e = document?.getElementById("virtual-table")?.parentNode;
    if (e) {
        // @ts-ignore
        e.scrollBy(0, 200);
        // @ts-ignore
        // console.log(e.scrollTop, e.offsetHeight);
    }
    setTimeout(() => {
        // @ts-ignore
        if (!e)
            dod();
        // @ts-ignore
        else if (e.scrollTop <= 15000) {
            dod();
        } else {
            onFinished();
        }
    }, 1);
}

const measurements: number[] = []

function onFinished() {
    console.log("finished");
    //print average measurement
    const sum = measurements.reduce((a, b) => a + b, 0);
    const avg = (sum / measurements.length) || 0;
    alert(`"finished, avg: ${avg}, count: ${measurements.length}`);
}

function onRenderCallback(
    id: string,
    phase: "mount" | "update" | "nested-update",
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
) {
    measurements.push(actualDuration)
    // if (actualDuration > 10)
    //     // Aggregate or log render timings...
    //     console.log(id, phase, actualDuration, baseDuration, startTime, commitTime, interactions);
}

const container = document.getElementById("root");
const root = createRoot(container as any);
root.render(
    <React.StrictMode>
        <Profiler id="App" onRender={onRenderCallback}>
            <App/>
        </Profiler>
    </React.StrictMode>
);
dod();
