import { CollectionSize } from "../models";
import { PreviewSize } from "../preview";

export const TINY_THUMBNAIL = 40;
export const SMALL_THUMBNAIL = 100;
export const REGULAR_THUMBNAIL = 200;

export function getThumbnailMeasure(size: PreviewSize): number {
    if (size === "tiny")
        return TINY_THUMBNAIL;
    else if (size === "small")
        return SMALL_THUMBNAIL;
    else if (size === "regular")
        return REGULAR_THUMBNAIL;
    else throw Error("Thumbnail size not mapped");
}

export function getPreviewSizeFrom(size: CollectionSize): PreviewSize {
    switch (size) {
        case "xs":
        case "s":
            return "tiny";
        case "m":
            return "small";
        case "l":
        case "xl":
            return "regular";
        default:
            throw Error("Missing mapping value in getPreviewSizeFrom");
    }
}
