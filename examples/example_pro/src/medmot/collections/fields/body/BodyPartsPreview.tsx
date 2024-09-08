import React from "react";
import { PropertyPreviewProps } from "@firecms/core";
import { ManBack } from "./man_back";
import { ManFront } from "./man_front";
import "./bodyparts.css";
import { bodyPartsMapReversed } from "./body_parts";


export default function BodyPartsPreview({
                                             height,
                                             width,
                                             property,
                                             customProps,
                                             value
                                         }: PropertyPreviewProps<any[] | any>) {

    const bodyPartsValue = value ?? (property.dataType === "array" ? [] : "");


    const multiselect = customProps.multiSelect;
    const mapped = customProps.mapped;

    let partsArray: string[] = multiselect ?
        (mapped ?
            (bodyPartsValue as string[]).flatMap(p => bodyPartsMapReversed[p])
            : bodyPartsValue as string[])
        : (mapped ? bodyPartsMapReversed[bodyPartsValue as string] : [bodyPartsValue as string]);

    if (!partsArray)
        partsArray = [];

    return (

        <div className="flex flex-row max-h-[300px] aspect-[1/1]" style={{maxWidth: width ? width : 300}}>
            <div className="flex-grow">
                <ManFront activeParts={partsArray}/>
            </div>
            <div className="flex-grow">
                <ManBack activeParts={partsArray}/>
            </div>
        </div>

    );

}

