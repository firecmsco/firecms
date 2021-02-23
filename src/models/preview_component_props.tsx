import React, { MouseEventHandler } from "react";
import { Property } from "./models";

export type PreviewSize = "regular" | "small" | "tiny";

export interface PreviewComponentFactoryProps {
    PreviewComponent: React.ComponentType<PreviewComponentProps<any>>
}

export interface PreviewComponentProps<T = any> {
    name?: string;
    value: T;
    property: Property<T>;
    onClick?: MouseEventHandler<any>;
    size: PreviewSize;
    /**
     * Max height assigned to the preview, depending on the context.
     * It may be undefined if unlimited.
     */
    height?: number;
    /**
     * Max height width to the preview, depending on the context.
     * It may be undefined if unlimited.
     */
    width?: number;
}
