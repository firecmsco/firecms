import React, { useEffect, useState } from "react";

import { Field, Form, Formik, FormikProps, getIn } from "formik";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
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

export function PropertyForm({
                                 asDialog,
                                 open,
                                 propertyKey,
                                 property,
                                 onOkClicked,
                                 onCancel,
                                 onPropertyChanged
                             }: {
    asDialog: boolean;
    open?: boolean;
    propertyKey?: string;
    property?: Property;
    onPropertyChanged: (id: string, property: Property) => void;
    onOkClicked?: () => void;
    onCancel?: () => void;
}) {

    const newProperty = !property;

    return (
        <Formik
            initialValues={property
                ? { id: propertyKey, ...property } as PropertyWithId
                : {
                    id: "",
                    title: ""
                } as PropertyWithId}
            onSubmit={(newPropertyWithId: PropertyWithId, formikHelpers) => {
                console.log("onSubmit", newPropertyWithId);
                const { id, ...property } = newPropertyWithId;
                onPropertyChanged(id, property);
                if (onOkClicked) {
                    console.log("onOkClicked", newPropertyWithId);
                    onOkClicked();
                }
            }}
        >
            {(props) => {

                const form = <PropertyEditView
                    onPropertyChanged={newProperty ? undefined : onPropertyChanged}
                    existing={Boolean(propertyKey)}
                    {...props}/>;

                let body: JSX.Element;
                if (asDialog) {
                    body =
                        <Dialog
                            open={open ?? false}
                            maxWidth={"sm"}
                            fullWidth
                            sx={(theme) => ({
                                height: "100vh"
                            })}>

                            <DialogContent>
                                {form}
                            </DialogContent>
                            <DialogActions>
                                {onCancel && <Button onClick={onCancel}>
                                    Cancel
                                </Button>}
                                <Button variant="contained"
                                        color="primary"
                                        onClick={props.handleSubmit}>
                                    Ok
                                </Button>
                            </DialogActions>
                        </Dialog>;
                } else {
                    body = form;
                }
                return <Form>{body}</Form>
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
        if (onPropertyChanged) {
            if (values.id) {
                const { id, ...property } = values;
                onPropertyChanged(id, property);
            }
        }
    }, [values, errors]);

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
