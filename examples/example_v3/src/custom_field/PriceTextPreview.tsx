import React from "react";
import { PropertyPreviewProps } from "@firecms/core";

export function PriceTextPreview({
                                     value,
                                     property,
                                     size,
                                     customProps,
                                     entity
                                 }: PropertyPreviewProps<number>) {

    return (
        <div className={`${value ? "" : "text-sm text-zinc-500"}`}>
            {value ?? "Not available"}
        </div>
    );

};
