import React from "react";

import { GeoPoint } from "../../types/index.js";
import { PropertyPreviewProps } from "../PropertyPreviewProps.js";
import { formatGeoPoint, getGeoPointCoordinates } from "../../util/index.js";

export function GeopointPropertyPreview({
                                             value,
                                             size
                                         }: PropertyPreviewProps<GeoPoint>): React.ReactElement {

    const coordinates = getGeoPointCoordinates(value);

    if (!coordinates) {
        return <span className={size === "small" ? "text-sm text-text-secondary dark:text-text-secondary-dark" : "text-text-secondary dark:text-text-secondary-dark"}>—</span>;
    }

    return (
        <span className={size === "small" ? "text-sm font-mono" : "font-mono"}>
            {formatGeoPoint(coordinates)}
        </span>
    );
}
