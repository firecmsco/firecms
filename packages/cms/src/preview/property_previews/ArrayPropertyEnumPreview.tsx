import type { ArrayProperty, NumberProperty, StringProperty } from "@rebasepro/types";import type { PropertyPreviewProps } from "../../types/components/PropertyPreviewProps";import { ArrayEnumPreview } from "../components/ArrayEnumPreview";
import { resolveEnumValues } from "@rebasepro/common";

/**
 * @group Preview components
 */
export function ArrayPropertyEnumPreview({
    propertyKey,
    value,
    property,
    size
}: PropertyPreviewProps<ArrayProperty>) {

    if (property.type !== "array")
        throw Error("Picked wrong preview component ArrayEnumPreview");

    const ofProperty = property.of as StringProperty | NumberProperty;
    if (!ofProperty.enum)
        throw Error("Picked wrong preview component ArrayEnumPreview");

    if (!value) return null;

    const enumValues = resolveEnumValues(ofProperty.enum);
    if (!enumValues)
        throw Error(
            `Enum values not resolved for property ${propertyKey}`
        )

    return <ArrayEnumPreview name={propertyKey}
        value={value}
        enumValues={enumValues}
        size={size} />;
}
