import { PreviewComponentProps, PreviewSize } from "../PreviewComponentProps";
import { useStyles } from "./styles";
import { ReferenceProperty } from "../../models";
import { ReferencePreview } from "./ReferencePreview";

/**
 * @category Preview components
 */
export function ArrayOfReferencesPreview({
                                             name,
                                             value,
                                             property,
                                             size
                                         }: PreviewComponentProps<any[]>) {

    if (property.dataType !== "array" || !property.of || property.of.dataType !== "reference")
        throw Error("Picked wrong preview component ArrayOfReferencesPreview");

    const classes = useStyles();
    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <>
            {value &&
            value.map((v, index) =>
                <div className={classes.arrayItem}
                     key={`preview_array_ref_${name}_${index}`}>
                    <ReferencePreview
                        name={`${name}[${index}]`}
                        size={childSize}
                        value={v}
                        property={property.of as ReferenceProperty}
                    />
                </div>
            )}
        </>
    );
}
