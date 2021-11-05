import { PreviewComponentProps } from "../PreviewComponentProps";
import { NumberProperty, StringProperty } from "../../models";
import { ArrayEnumPreview } from "./ArrayEnumPreview";

/**
 * @category Preview components
 */
export function ArrayPropertyEnumPreview({
                                             name,
                                             value,
                                             property,
                                             size
                                         }: PreviewComponentProps<string[] | number[]>) {

    if (property.dataType !== "array")
        throw Error("Picked wrong preview component ArrayEnumPreview");

    const ofProperty = property.of as StringProperty | NumberProperty;
    if (!ofProperty.config?.enumValues)
        throw Error("Picked wrong preview component ArrayEnumPreview");

    if (!value) return null;

    const enumValues = ofProperty.config?.enumValues;

    return <ArrayEnumPreview name={name}
                             value={value}
                             enumValues={enumValues}
                             size={size}/>;
}
