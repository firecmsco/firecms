import React, { useEffect, useState } from "react";

import { getIn, useFormikContext } from "formik";
import {
    Box,
    InputAdornment,
    MenuItem,
    Select,
    Typography
} from "@mui/material";

import { Property } from "../../../models";
import { StringPropertyField } from "./properties/StringPropertyField";
import { getWidgetId, WidgetId, WIDGETS } from "../../util/widgets";

export function PropertyEditView({
                                     propertyKey,
                                     property
                                 }: { propertyKey: string, property: Property }) {

    const { setFieldValue, values } = useFormikContext();
    const [selectedWidgetId, setSelectedWidgetId] = useState<WidgetId | undefined>(property ? getWidgetId(property) : undefined);
    const propertyPath = "properties." + propertyKey.replace(".", ".properties.");

    const selectedWidget = selectedWidgetId ? WIDGETS[selectedWidgetId] : undefined;
    useEffect(() => {
        setSelectedWidgetId(property ? getWidgetId(property) : undefined);
    }, [property, propertyKey]);

    useEffect(() => {
        const currentProperty = getIn(values, propertyPath);

        if (selectedWidgetId === "text_field") {
            setFieldValue(propertyPath, {
                ...currentProperty,
                dataType: "string",
                multiline: false,
                markdown: false,
                email: false,
                url: false
            });
        } else if (selectedWidgetId === "multiline") {
            setFieldValue(propertyPath, {
                ...currentProperty,
                dataType: "string",
                multiline: true,
                markdown: false,
                email: false,
                url: false
            });
        } else if (selectedWidgetId === "markdown") {
            setFieldValue(propertyPath, {
                ...currentProperty,
                dataType: "string",
                multiline: false,
                markdown: true,
                email: false,
                url: false
            });
        } else if (selectedWidgetId === "url") {
            setFieldValue(propertyPath, {
                ...currentProperty,
                dataType: "string",
                multiline: false,
                markdown: false,
                email: false,
                url: true
            });
        } else if (selectedWidgetId === "email") {
            setFieldValue(propertyPath, {
                ...currentProperty,
                dataType: "string",
                multiline: false,
                markdown: false,
                email: true,
                url: false
            });
        }
    }, [selectedWidgetId, propertyPath, selectedWidget]);

    let childComponent;
    if (selectedWidgetId === "text_field" ||
        selectedWidgetId === "multiline" ||
        selectedWidgetId === "markdown" ||
        selectedWidgetId === "url" ||
        selectedWidgetId === "email") {
        childComponent = <StringPropertyField propertyPath={propertyPath}
                                              widgetId={selectedWidgetId}/>;
    } else {
        childComponent = <Box>
            {property.title}
        </Box>;
    }

    const Icon = selectedWidget?.icon;

    return (
        <>
            <Typography
                variant={"subtitle2"}
                sx={{ mb: 2 }}>
                Property
            </Typography>

            <Select fullWidth
                    value={selectedWidgetId}
                    title={"Component"}
                    sx={{ mb: 2 }}
                    startAdornment={
                        Icon
                            ? <InputAdornment
                                key={"adornment_" + selectedWidgetId}
                                position="start">
                                <Icon/>
                            </InputAdornment>
                            : undefined}
                    onChange={(e) => setSelectedWidgetId(e.target.value as WidgetId)}>
                {Object.entries(WIDGETS).map(([key, widget]) => (
                    <MenuItem value={key} key={key}>
                        {widget.name}
                    </MenuItem>
                ))}
            </Select>

            {childComponent}
        </>
    );
}
