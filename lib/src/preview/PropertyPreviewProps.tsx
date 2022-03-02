import { MouseEventHandler } from "react";
import { CMSType, Property, ResolvedProperty } from "../models";

/**
 * @category Preview components
 */
export type PreviewSize = "regular" | "small" | "tiny";

/**
 * @category Preview components
 */
export interface PropertyPreviewProps<T extends CMSType = CMSType, CustomProps = any> {
    /**
     * Name of the property
     */
    propertyKey?: string;

    /**
     * Current value of the property
     */
    value: T;

    /**
     * Property this display is related to
     */
    property: Property<T> | ResolvedProperty<T>;

    /**
     * Click handler
     */
    onClick?: MouseEventHandler<any>;

    /**
     * Desired size of the preview, depending on the context.
     */
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

    /**
     * Additional properties set by the developer
     */
    customProps?: CustomProps;
}
