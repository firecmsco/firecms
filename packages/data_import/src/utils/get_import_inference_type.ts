import { DataType } from "@firecms/core";
import { isIsoDateText } from "./text_values";

export function getInferenceType(value: any): DataType {
    if (typeof value === "number")
        return "number";
    // A CSV cell is text until mapped, so an ISO date column would otherwise be
    // proposed as a text property; SheetJS used to hand it over as a Date.
    else if (typeof value === "string")
        return isIsoDateText(value) ? "date" : "string";
    else if (typeof value === "boolean")
        return "boolean";
    else if (value instanceof Date)
        return "date";
    else if (Array.isArray(value))
        return "array";
    return "map";
}


function isUnixTimestamp(num: number): boolean {
    const numString = num.toString();
    // check if the number has 13 digits
    const isLengthValid = numString.length === 13;

    // check if it falls in the expected Unix timestamp range (from 1970 to 2100)
    const isInRange = num >= 0 && num <= 4102444800000;

    return isLengthValid && isInRange;
}
