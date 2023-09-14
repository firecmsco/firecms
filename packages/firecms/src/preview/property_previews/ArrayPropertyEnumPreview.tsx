import { ResolvedNumberProperty, ResolvedStringProperty } from "../../types";
import { ArrayEnumPreview } from "../components/ArrayEnumPreview";
import { PropertyPreviewProps } from "../PropertyPreviewProps";

/**
 * @category Preview components
 */
export function ArrayPropertyEnumPreview({
                                             propertyKey,
                                             value,
                                             property,
                                             size
                                         }: PropertyPreviewProps<string[] | number[]>) {

    if (property.dataType !== "array")
        throw Error("Picked wrong preview component ArrayEnumPreview");

    const ofProperty = property.of as ResolvedStringProperty | ResolvedNumberProperty;
    if (!ofProperty.enumValues)
        throw Error("Picked wrong preview component ArrayEnumPreview");

    if (!value) return null;

    return <ArrayEnumPreview name={propertyKey}
                             value={value}
                             enumValues={ofProperty.enumValues}
                             size={size}/>;
}
