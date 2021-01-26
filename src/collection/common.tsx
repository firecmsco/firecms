import {
    ArrayProperty,
    CollectionSize,
    Property,
    StringProperty
} from "../models";

export function getCellAlignment<T>(property: Property<T>): "right" | "left" | "center" {
    if (property.dataType === "boolean") {
        return "center";
    } else if (property.dataType === "number" || property.dataType === "timestamp") {
        return "right";
    } else {
        return "left";
    }
}

export function getPreviewWidth<T>(property: Property<T>, size: CollectionSize): number {

    if (property.columnWidth) {
        return property.columnWidth;
    }

    if (property.dataType === "string") {
        const stringProperty = property as StringProperty;
        if (stringProperty.config?.url) {
            if (stringProperty.config?.url === "video" || stringProperty.config?.storageMeta?.mediaType === "video")
                return 340;
            else if (stringProperty.config?.url === "audio" || stringProperty.config?.storageMeta?.mediaType === "audio")
                return 300;
            return 240;
        } else if (stringProperty.config?.storageMeta) {
            return 220;
        } else if (stringProperty.config?.enumValues) {
            return 180;
        } else if (stringProperty.config?.multiline) {
            return 300;
        } else if (stringProperty.config?.markdown) {
            return 300;
        } else if (stringProperty.validation?.email) {
            return 200;
        } else {
            return 200;
        }
    } else if (property.dataType === "array") {
        const arrayProperty = property as ArrayProperty;
        if ("dataType" in arrayProperty.of) {
            return getPreviewWidth(arrayProperty.of, size);
        } else {
            return 300;
        }
    } else if (property.dataType === "number") {
        return 140;
    } else if (property.dataType === "map") {
        return 360;
    } else if (property.dataType === "timestamp") {
        return 160;
    } else if (property.dataType === "reference") {
        return 220;
    } else if (property.dataType === "boolean") {
        return 140;
    } else {
        return 200;
    }
}

export function getRowHeight(size:CollectionSize) : number{
    switch (size){
        case "xl":
            return 400;
        case "l":
            return 280;
        case "m":
            return 140;
        case "s":
            return 80;
        case "xs":
            return 54;
        default:
            throw Error("Missing mapping for collection size -> height");
    }
}
