import { PreviewComponentProps, PreviewSize } from "../internal";
import { styled } from '@mui/material/styles';
import { ResolvedReferenceProperty } from "../../models";
import { ReferencePropertyPreview } from "./ReferencePropertyPreview";

import { Theme } from "@mui/material";

const PREFIX = 'ArrayOfReferencesPreview';

const classes = {
    arrayItem: `${PREFIX}-arrayItem`
};

const Root = styled('div')((
   { theme } : {
        theme: Theme
    }
) => ({
    [`& .${classes.arrayItem}`]: {
        margin: theme.spacing(0.5)
    }
}));



/**
 * @category Preview components
 */
export function ArrayOfReferencesPreview({
                                             propertyKey,
                                             value,
                                             property,
                                             size
                                         }: PreviewComponentProps<any[]>) {

    if (property.dataType !== "array" || !property.of || property.of.dataType !== "reference")
        throw Error("Picked wrong preview component ArrayOfReferencesPreview");


    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        (<Root>
            {value &&
            value.map((v, index) =>
                <div className={classes.arrayItem}
                     key={`preview_array_ref_${propertyKey}_${index}`}>
                    <ReferencePropertyPreview
                        propertyKey={`${propertyKey}[${index}]`}
                        size={childSize}
                        value={v}
                        property={property.of as ResolvedReferenceProperty}
                    />
                </div>
            )}
        </Root>)
    );
}
