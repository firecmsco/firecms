import { PreviewSize, PropertyPreviewProps, ReferencePreview } from "../index";
import { ResolvedReferenceProperty } from "../../types";

import { Box } from "@mui/material";
import { resolveArrayProperty } from "../../core";
import { useFireCMSContext } from "../../hooks";

/**
 * @category Preview components
 */
export function ArrayOfReferencesPreview({
                                             propertyKey,
                                             value,
                                             property: inputProperty,
                                             size
                                         }: PropertyPreviewProps<any[]>) {

    const fireCMSContext = useFireCMSContext();
    const property = resolveArrayProperty({
        propertyKey,
        property: inputProperty,
        propertyValue: value,
        fields: fireCMSContext.fields
    });

    if (Array.isArray(property?.of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }

    if (property?.dataType !== "array" || !property.of || property.of.dataType !== "reference")
        throw Error("Picked wrong preview component ArrayOfReferencesPreview");

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%"
        }}>
            {value &&
                value.map((reference, index) => {
                        const ofProperty = property.of as ResolvedReferenceProperty;
                        return <Box sx={{
                            marginTop: 0.25,
                            marginBottom: 0.25,
                            width: "100%"
                        }}
                                    key={`preview_array_ref_${propertyKey}_${index}`}>
                            <ReferencePreview
                                disabled={!ofProperty.path}
                                previewProperties={ofProperty.previewProperties}
                                size={childSize}
                                reference={reference}
                            />
                        </Box>;
                    }
                )}
        </Box>
    );
}
