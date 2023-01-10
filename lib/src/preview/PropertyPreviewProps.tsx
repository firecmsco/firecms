import { CMSType, Entity, Property, ResolvedProperty } from "../types";

/**
 * @category Preview components
 */
export type PreviewSize = "regular" | "small" | "tiny";

/**
 * @category Preview components
 */
export interface PropertyPreviewProps<T extends CMSType = any, CustomProps = any, M extends Record<string, any> = Record<string, any>> {
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
    onClick?: () => void;

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
     * Entity this property refers to
     */
    entity?: Entity<M>;
}
