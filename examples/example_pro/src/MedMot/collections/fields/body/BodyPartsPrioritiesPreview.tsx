import React from "react";
import { ManBack } from "./man_back";
import { ManFront } from "./man_front";
import "./bodyparts.css";
import { bodyPartsMap } from "./body_parts";
import { PropertyPreviewProps } from "@firecms/core";


export default function BodyPartsPrioritiesPreview({
                                                       height,
                                                       width,
                                                       value
                                                   }: PropertyPreviewProps<any>) {

    const partsArray: Record<string, "blue-dark" | "blue" | "blue-light"> =
        !value ? {} :
            Object.entries(value)
                .map(([key, value]) => {
                    let color;
                    if (value === 1) color = "blue-light";
                    else if (value === 2) color = "blue";
                    else if (value === 3) color = "blue-dark";
                    return { [key]: color };
                })
                .reduce((a, b) => ({ ...a, ...b }), {}) as Record<string, "blue-dark" | "blue" | "blue-light">;

    return (

        <div className="grid" style={{ maxHeight: height, maxWidth: height }}>
            <div className="col-span-1">
                <ManFront activeParts={partsArray}/>
            </div>
            <div className="col-span-1">
                <ManBack activeParts={partsArray}/>
            </div>
        </div>

    );

}


const bodyPartsMapReversed: Record<string, string[]> = {};
Object.entries(bodyPartsMap)
    .forEach(([key, value]) => {
        if (bodyPartsMapReversed[value])
            bodyPartsMapReversed[value].push(key);
        else
            bodyPartsMapReversed[value] = [key];
    });
