import { InferPropertyType, Property } from "../types";

/**
 * @group Preview components
 */
export type PreviewSize = "small" | "medium" | "large";

/**
 * @group Preview components
 */
export interface PropertyPreviewProps<P extends Property, CustomProps = any> {
    /**
     * Name of the property
     */
    propertyKey?: string;

    /**
     * Current value of the property, inferred from the property schema P
     */
    value: InferPropertyType<P>;

    /**
     * Property this display is related to, now strongly typed to P
     */
    property: P;

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

    /**
     * If the preview should be interactive or not.
     * This applies only to videos.
     */
    interactive?: boolean;

}
