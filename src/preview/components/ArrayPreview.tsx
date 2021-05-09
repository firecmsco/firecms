import { PreviewComponentProps, PreviewSize } from "../../preview";
import ErrorBoundary from "../../components/ErrorBoundary";

import React from "react";

import { Divider } from "@material-ui/core";
import { PreviewComponent } from "../PreviewComponent";
import { useStyles } from "./styles";
import { Property } from "../../models";
import { useTranslation } from "react-i18next";

export function ArrayPreview({
                                 name,
                                 value,
                                 property,
                                 size
                             }: PreviewComponentProps<any[]>) {
    const { t } = useTranslation();

    if (!property.of) {
        throw Error(t("errorMissingOfPropForArrayField", {name}));
    }

    const classes = useStyles();

    if (property.dataType !== "array")
        throw Error(t("errorPickedWrongPreviewComponent", { component: "ArrayPreview" }));

    const values = value;

    if (!values) return null;

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <>
            {values &&
            values.map((value, index) =>
                <React.Fragment key={"preview_array_" + value + "_" + index}>
                    <div className={classes.arrayItemBig}>
                        <ErrorBoundary>
                            <PreviewComponent
                                name={name}
                                value={value}
                                property={property.of as Property}
                                size={childSize}/>
                        </ErrorBoundary>
                    </div>
                    {index < values.length - 1 && <Divider/>}
                </React.Fragment>
            )}
        </>
    );
}
