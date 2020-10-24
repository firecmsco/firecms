import { EntitySchema, Property } from "../models";

export type PreviewSize = "regular" | "small" | "tiny";

export interface PreviewComponentProps<T = any> {
    name: string,
    value: T,
    property: Property<T>,
    size: PreviewSize,
    entitySchema: EntitySchema
}

export const TINY_THUMBNAIL = 40;
export const SMALL_THUMBNAIL = 100;
export const REGULAR_THUMBNAIL = 200;

export function getThumbnailMeasure(size: PreviewSize):number {
    if (size === "tiny")
        return TINY_THUMBNAIL;
    else if (size === "small")
        return SMALL_THUMBNAIL;
    else if (size === "regular")
        return REGULAR_THUMBNAIL;
    else throw Error("Thumbanil size not mapped");
}
