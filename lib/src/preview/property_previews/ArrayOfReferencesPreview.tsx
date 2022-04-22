import {
    PropertyPreviewProps,
    PreviewSize,
    ReferencePreview
} from "../internal";
import { ResolvedReferenceProperty } from "../../models";

import { Box } from "@mui/material";

/**
 * @category Preview components
 */
export function ArrayOfReferencesPreview({
                                             propertyKey,
                                             value,
                                             property,
                                             size
                                         }: PropertyPreviewProps<any[]>) {

    if (Array.isArray(property.of)) {
        throw Error("Using array properties instead of single one in `of` in ArrayProperty");
    }

    if (property.dataType !== "array" || !property.of || property.of.dataType !== "reference")
        throw Error("Picked wrong preview component ArrayOfReferencesPreview");

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        (<>
            {value &&
                value.map((reference, index) => {
                        const ofProperty = property.of as ResolvedReferenceProperty;
                        return <Box sx={{
                            margin: 0.5
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
        </>)
    );
}
