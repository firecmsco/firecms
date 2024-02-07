import React from "react";
import {
    Property,
    PropertyPreview,
    PropertyPreviewProps
} from "@firecms/firebase_pro";
import { CustomShapedArrayProps } from "./CustomShapedArrayProps";

export default function CustomShapedArrayPreview({
                                                     value,
                                                     size,
                                                     customProps
                                                 }: PropertyPreviewProps<any[], CustomShapedArrayProps>)
     {

    if (!customProps)
        throw Error("Properties not specified");

    const properties: Property[] = customProps.properties;

    return <div>
        {properties.map((property, index) => (
            <div className="m-2" key={`custom_shaped_array_${index}`}>
                <PropertyPreview
                    property={property}
                    value={value[index]}
                    size={size}/>
            </div>
        ))}
    </div>;

}
