import { Property } from "./models";

export function isReadOnly(property: Property): boolean {
    if (property.readOnly)
        return true;
    if (property.dataType === "timestamp") {
        if (Boolean(property.autoValue))
            return true;
    }
    return false;
}
