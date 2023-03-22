import React from "react";

import { styled } from "@mui/material/styles";

import { Divider, Theme } from "@mui/material";
import { PreviewSize, PropertyPreview, PropertyPreviewProps } from "../index";
import { ErrorBoundary, resolveArrayProperty } from "../../core";
import { ResolvedProperty } from "../../types";
import {
    DEFAULT_ONE_OF_TYPE,
    DEFAULT_ONE_OF_VALUE
} from "../../core/util/common";
import { useFireCMSContext } from "../../hooks";

const PREFIX = "ArrayOneOfPreview";

const classes = {
    array: `${PREFIX}-array`,
    arrayWrap: `${PREFIX}-arrayWrap`,
    arrayItemBig: `${PREFIX}-arrayItemBig`
};

const Root = styled("div")((
   { theme } : {
        theme: Theme
    }
) => ({
    [`&.${classes.array}`]: {
        display: "flex",
        flexDirection: "column"
    },

    [`& .${classes.arrayWrap}`]: {
        display: "flex",
        flexWrap: "wrap"
    },

    [`& .${classes.arrayItemBig}`]: {
        margin: theme.spacing(1)
    }
}));

/**
 * @category Preview components
 */
export function ArrayOneOfPreview({
                                      propertyKey,
                                      value,
                                      property: inputProperty,
                                      size,
                                      entity
                                  }: PropertyPreviewProps<any[]>) {

    const fireCMSContext = useFireCMSContext();
    const property = resolveArrayProperty({
        propertyKey,
        property: inputProperty,
        propertyValue: value,
        fields: fireCMSContext.fields
    });

    if (property?.dataType !== "array")
        throw Error("Picked wrong preview component ArrayPreview");

    if (!property?.oneOf) {
        throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${propertyKey}`);
    }

    const values = value;

    if (!values) return null;

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    const typeField = property.oneOf.typeField ?? DEFAULT_ONE_OF_TYPE;
    const valueField = property.oneOf.valueField ?? DEFAULT_ONE_OF_VALUE;
    const properties = property.oneOf.properties;

    return (
        <Root className={classes.array}>
            {values &&
                values.map((value, index) =>
                    <React.Fragment
                        key={"preview_array_" + value + "_" + index}>
                        <div className={classes.arrayItemBig}>
                            <ErrorBoundary>
                                {value && <PropertyPreview
                                propertyKey={propertyKey}
                                value={value[valueField]}
                                entity={entity}
                                property={(property.resolvedProperties[index] ?? properties[value[typeField]]) as ResolvedProperty<any>}
                                size={childSize}/>}
                        </ErrorBoundary>
                    </div>
                    {index < values.length - 1 && <Divider/>}
                </React.Fragment>
            )}
        </Root>
    );
}
