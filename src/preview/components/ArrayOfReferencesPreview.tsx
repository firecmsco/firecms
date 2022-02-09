import { PreviewComponentProps, PreviewSize } from "../internal";
import { styled } from '@mui/material/styles';
import { ReferenceProperty } from "../../models";
import { ReferencePreview } from "./ReferencePreview";

import { Theme } from "@mui/material";

const PREFIX = 'ArrayOfReferencesPreview';

const classes = {
    arrayItem: `${PREFIX}-arrayItem`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
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
                                             name,
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
                     key={`preview_array_ref_${name}_${index}`}>
                    <ReferencePreview
                        name={`${name}[${index}]`}
                        size={childSize}
                        value={v}
                        property={property.of as ReferenceProperty}
                    />
                </div>
            )}
        </Root>)
    );
}
