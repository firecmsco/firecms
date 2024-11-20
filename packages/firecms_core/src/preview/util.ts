import { CollectionSize } from "../types";
import { PreviewSize } from "./PropertyPreviewProps";

export const SMALL_THUMBNAIL = 40;
export const MEDIUM_THUMBNAIL = 100;
export const LARGE_THUMBNAIL = 200;

export function getThumbnailMeasure(size: PreviewSize): number {
    if (size === "small")
        return SMALL_THUMBNAIL;
    else if (size === "medium")
        return MEDIUM_THUMBNAIL;
    else if (size === "large")
        return LARGE_THUMBNAIL;
    else throw Error("Thumbnail size not mapped");
}

export function getPreviewSizeFrom(size: CollectionSize): PreviewSize {
    switch (size) {
        case "xs":
        case "s":
            return "small";
        case "m":
            return "medium";
        case "l":
        case "xl":
            return "large";
        default:
            throw Error("Missing mapping value in getPreviewSizeFrom: " + size);
    }
}
