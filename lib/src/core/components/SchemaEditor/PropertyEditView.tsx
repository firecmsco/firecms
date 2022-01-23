import React, { useEffect, useState } from "react";

import { Field, Form, Formik, FormikProps, getIn } from "formik";
import {
    Box,
    Button,
    Dialog,
    Grid,
    InputAdornment,
    MenuItem,
    Select,
    TextField,
    Typography
} from "@mui/material";

import { Property } from "../../../models";
import { StringPropertyField } from "./properties/StringPropertyField";
import { getWidgetId, WidgetId, WIDGETS } from "../../util/widgets";
import { buildProperty } from "../../builders";

export type PropertyWithId = Property & { id: string };

export function NewPropertyDialog({ open, onPropertyCreated, onCancel }:
                                      {
                                          open: boolean;
                                          onPropertyCreated: (id: string, property: Property) => void;
                                          onCancel: () => void;
                                      }) {

    return (
        <Dialog
            open={open}
            maxWidth={"sm"}
            fullWidth
            sx={(theme) => ({
                height: "100vh"
            })}>
            <Box
                sx={(theme) => ({
                    backgroundColor: theme.palette.background.paper,
                })}>
                <PropertyForm autoSubmit={false}
                              onCancel={onCancel}
                              onPropertyChanged={onPropertyCreated}/>
            </Box>
        </Dialog>
    )
}

export function PropertyForm({
                                 propertyKey,
                                 property,
                                 onPropertyChanged,
                                 onCancel,
                                 autoSubmit
                             }: {
    autoSubmit: boolean;
    propertyKey?: string;
    property?: Property;
    onCancel?: () => void;
    onPropertyChanged: (id: string, property: Property) => void;
}) {

    return (
        <Formik
            initialValues={property
                ? { id: propertyKey, ...property } as PropertyWithId
                : {
                    id: "",
                    title: ""
                } as PropertyWithId}
            onSubmit={(newPropertyWithId: PropertyWithId, formikHelpers) => {
                const { id, ...property } = newPropertyWithId;
                onPropertyChanged(id, property);
            }}
        >
            {(props) => {

                return (
                    <Form>
                        <Box sx={{ p: 2 }}>
                            <PropertyEditView
                                onPropertyChanged={autoSubmit ? onPropertyChanged : undefined}
                                existing={Boolean(propertyKey)}
                                {...props}/>
                        </Box>

                        {!autoSubmit &&
                        <Box sx={(theme) => ({
                            background: theme.palette.mode === "light" ? "rgba(255,255,255,0.6)" : "rgba(255, 255, 255, 0)",
                            backdropFilter: "blur(4px)",
                            borderTop: `1px solid ${theme.palette.divider}`,
                            py: 1,
                            px: 2,
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "end",
                            position: "sticky",
                            bottom: 0,
                            zIndex: 200
                        })}
                        >

                            {onCancel && <Button
                                variant="text"
                                color="primary"
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>}

                            <Button
                                variant={!props.isValid ? "text" : "contained"}
                                color="primary"
                                type="submit"
                                disabled={!props.dirty}
                            >
                                Ok
                            </Button>

                        </Box>}

                    </Form>
                )
            }}

        </Formik>

    );

}

function PropertyEditView({
                              values,
                              errors,
                              touched,
                              setValues,
                              existing,
                              onPropertyChanged
                          }: {
    existing: boolean;
    onPropertyChanged?: (id: string, property: Property) => void;
} & FormikProps<PropertyWithId>) {

    const [selectedWidgetId, setSelectedWidgetId] = useState<WidgetId | undefined>(values ? getWidgetId(values) : undefined);

    const selectedWidget = selectedWidgetId ? WIDGETS[selectedWidgetId] : undefined;
    useEffect(() => {
        if (values.id && onPropertyChanged) {
            const { id, ...property } = values;
            onPropertyChanged(id, property);
        }
    }, [values]);

    useEffect(() => {
        const propertyData = values as any;
        let updatedProperty;
        if (selectedWidgetId === "text_field") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "string",
                    multiline: undefined,
                    markdown: undefined,
                    email: undefined,
                    url: undefined,
                    enumValues: undefined
                })
            });
        } else if (selectedWidgetId === "multiline") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "string",
                    multiline: true,
                    markdown: undefined,
                    email: undefined,
                    url: undefined,
                    enumValues: undefined
                })
            });
        } else if (selectedWidgetId === "markdown") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "string",
                    multiline: undefined,
                    markdown: true,
                    email: undefined,
                    url: undefined
                })
            });
        } else if (selectedWidgetId === "url") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "string",
                    multiline: undefined,
                    markdown: undefined,
                    email: undefined,
                    url: true,
                    enumValues: undefined
                })
            });
        } else if (selectedWidgetId === "email") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "string",
                    multiline: undefined,
                    markdown: undefined,
                    email: true,
                    url: undefined,
                    enumValues: undefined
                })
            });
        } else if (selectedWidgetId === "select") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "string",
                    multiline: undefined,
                    markdown: undefined,
                    email: undefined,
                    url: undefined,
                    enumValues: propertyData.enumValues ?? undefined
                })
            });
        } else if (selectedWidgetId === "multi_select") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "array",
                    of: {
                        dataType: "string",
                        enumValues: propertyData.of?.enumValues ?? undefined
                    }
                })
            });
        } else if (selectedWidgetId === "number_input") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "number",
                    enumValues: undefined
                })
            });
        } else if (selectedWidgetId === "number_select") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "number",
                    enumValues: propertyData.enumValues ?? []
                })
            });
        } else if (selectedWidgetId === "multi_number_select") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "array",
                    of: {
                        dataType: "number",
                        enumValues: propertyData.of?.enumValues ?? []
                    }
                })
            });
        } else if (selectedWidgetId === "file_upload") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "string",
                    storage: {
                        storagePath: "/"
                    }
                })
            });
        } else if (selectedWidgetId === "multi_file_upload") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "array",
                    of: {
                        dataType: "string",
                        storage: propertyData.of?.storage ?? {
                            storagePath: "/"
                        }
                    }
                })
            });
        } else if (selectedWidgetId === "group") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "map",
                    properties: propertyData.properties ?? {}
                })
            });
        } else if (selectedWidgetId === "reference") {
            updatedProperty = ({
                ...propertyData,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                ...buildProperty({
                    dataType: "reference"
                })
            });
        } else if (selectedWidgetId === "multi_references") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "array",
                    of: {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        dataType: "reference"
                    }
                })
            });
        } else if (selectedWidgetId === "switch") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "boolean"
                })
            });
        } else if (selectedWidgetId === "date_time") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "timestamp"
                })
            });
        } else if (selectedWidgetId === "repeat") {
            updatedProperty = ({
                ...propertyData,
                ...buildProperty({
                    dataType: "array"
                })
            });
        }

        if (updatedProperty) {
            setValues(updatedProperty);
        }

    }, [selectedWidgetId]);

    let childComponent;
    if (selectedWidgetId === "text_field" ||
        selectedWidgetId === "multiline" ||
        selectedWidgetId === "markdown" ||
        selectedWidgetId === "url" ||
        selectedWidgetId === "email") {
        childComponent = <StringPropertyField widgetId={selectedWidgetId}/>;
    } else {
        childComponent = <Box>
            {values?.title}
        </Box>;
    }

    const Icon = selectedWidget?.icon;

    const title = "title";
    const titleTouched = getIn(touched, title);
    const titleError = getIn(errors, title);

    const id = "id";
    const idError = getIn(errors, id);
    const idTouched = getIn(touched, id);

    return (
        <Grid container spacing={2} direction={"column"}>

            <Grid item>
                <Typography
                    variant={"subtitle2"}>
                    Property
                </Typography>
            </Grid>

            <Grid item>
                <Select fullWidth
                        value={selectedWidgetId}
                        title={"Component"}
                        startAdornment={
                            Icon
                                ? <InputAdornment
                                    key={"adornment_" + selectedWidgetId}
                                    position="start">
                                    <Icon/>
                                </InputAdornment>
                                : undefined}
                        renderValue={(value) => WIDGETS[value].name}
                        onChange={(e) => setSelectedWidgetId(e.target.value as WidgetId)}>

                    {Object.entries(WIDGETS).map(([key, widget]) => {
                        const Icon = widget.icon;
                        return (
                            <MenuItem value={key} key={key}>
                                <Icon sx={{ mr: 3 }}/>
                                {widget.name}
                            </MenuItem>
                        );
                    })}

                </Select>

            </Grid>

            <Grid item>
                <Field name={id}
                       as={TextField}
                       label={"Id"}
                       disabled={existing}
                       required
                       fullWidth
                       helperText={idError && idTouched && <>{idError}</>}
                       error={idTouched && Boolean(idError)}/>

            </Grid>

            <Grid item>
                <Field name={title}
                       as={TextField}
                       validate={validateTitle}
                       label={"Title"}
                       required
                       fullWidth
                       helperText={titleError && titleTouched && <>{titleError}</>}
                       error={titleTouched && Boolean(titleError)}/>
            </Grid>

            <Grid item>
                {childComponent}
            </Grid>

        </Grid>
    );
}

function validateTitle(value: string) {
    let error;
    if (!value) {
        error = "You must specify a title for the property";
    }
    return error;
}
