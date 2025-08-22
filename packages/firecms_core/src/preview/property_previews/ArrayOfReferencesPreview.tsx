import { PreviewSize, PropertyPreviewProps, ResolvedReferenceProperty } from "@firecms/types";
import { resolveArrayProperty } from "../../util";
import { useAuthController, useCustomizationController } from "../../hooks";
import { ReferencePreview } from "../components/ReferencePreview";

/**
 * @group Preview components
 */
export function ArrayOfReferencesPreview({
                                             propertyKey,
                                             value,
                                             property: inputProperty,
                                             size
                                         }: PropertyPreviewProps<any[]>) {
    const authController = useAuthController();
    const customizationController = useCustomizationController();
    const property = resolveArrayProperty({
        propertyKey,
        property: inputProperty,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    });

    if (Array.isArray(property?.of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }

    if (property?.type !== "array" || !property.of || property.of.type !== "reference")
        throw Error("Picked wrong preview component ArrayOfReferencesPreview");

    const childSize: PreviewSize = size === "medium" ? "medium" : "small";

    return (
        <div className="flex flex-col w-full">
            {value &&
                value.map((reference, index) => {
                        const ofProperty = property.of as ResolvedReferenceProperty;
                        return <div className="mt-1 mb-1 w-full"
                                    key={`preview_array_ref_${propertyKey}_${index}`}>
                            <ReferencePreview
                                disabled={!ofProperty.path}
                                previewProperties={ofProperty.previewProperties}
                                size={childSize}
                                reference={reference}
                                includeId={ofProperty.includeId}
                                includeEntityLink={ofProperty.includeEntityLink}
                            />
                        </div>;
                    }
                )}
        </div>
    );
}
