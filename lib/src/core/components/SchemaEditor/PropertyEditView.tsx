import React, { useEffect, useState } from "react";

import { Field, Form, Formik, FormikProps, getIn } from "formik";
import equal from "react-fast-compare"
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Grid,
    InputAdornment,
    MenuItem,
    Select,
    TextField
} from "@mui/material";

import { Property } from "../../../models";
import { StringPropertyField } from "./properties/StringPropertyField";
import { getWidgetId, WidgetId, WIDGETS } from "../../util/widgets";
import { buildProperty } from "../../builders";
import { EnumPropertyField } from "./properties/EnumPropertyField";
import { toSnakeCase } from "../../util/strings";
import { useDebounce } from "../../internal/useDebounce";
import { CustomDialogActions } from "../CustomDialogActions";
import { removeUndefined } from "../../util/objects";

export type PropertyWithId = Property & { id: string };

export function PropertyForm({
                                 asDialog,
                                 open,
                                 propertyId,
                                 property,
                                 onOkClicked,
                                 onCancel,
                                 onPropertyChanged,
                                 onError,
                                 showErrors
                             }: {
    asDialog: boolean;
    open?: boolean;
    propertyId?: string;
    property?: Property;
    onPropertyChanged: (id: string, property: Property) => void;
    onError?: (id: string, error: boolean) => void;
    onOkClicked?: () => void;
    onCancel?: () => void;
    showErrors: boolean;
}) {

    return (
        <Formik
            initialValues={property
                ? { id: propertyId, ...property } as PropertyWithId
                : {
                    id: "",
                    title: ""
                } as PropertyWithId}
            onSubmit={(newPropertyWithId: PropertyWithId, formikHelpers) => {
                const { id, ...property } = newPropertyWithId;
                onPropertyChanged(id, property);
                if (onOkClicked) {
                    onOkClicked();
                }
            }}
        >
            {(props) => {

                const form = <PropertyEditView
                    onPropertyChanged={asDialog ? undefined : onPropertyChanged}
                    onError={onError}
                    showErrors={showErrors}
                    existing={Boolean(propertyId)}
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

                            <DialogContent sx={(theme) => ({
                                backgroundColor: theme.palette.background.paper
                            })}>
                                {form}
                            </DialogContent>
                            <CustomDialogActions>
                                {onCancel && <Button onClick={onCancel}>
                                    Cancel
                                </Button>}
                                <Button variant="contained"
                                        color="primary"
                                        onClick={() => props.handleSubmit()}>
                                    Ok
                                </Button>
                            </CustomDialogActions>
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
                              setFieldValue,
                              existing,
                              onPropertyChanged,
                              onError,
                              showErrors
                          }: {
    existing: boolean;
    onPropertyChanged?: (id: string, property: Property) => void;
    onError?: (id: string, error: boolean) => void;
    showErrors: boolean;
} & FormikProps<PropertyWithId>) {

    const [selectedWidgetId, setSelectedWidgetId] = useState<WidgetId | undefined>(values ? getWidgetId(values) : undefined);

    const selectedWidget = selectedWidgetId ? WIDGETS[selectedWidgetId] : undefined;

    const initialValuesRef = React.useRef(values);

    const doUpdate = React.useCallback(() => {
        if (onPropertyChanged) {
            if (values.id && !equal(initialValuesRef.current, removeUndefined(values))) {
                const { id, ...property } = values;
                onPropertyChanged(id, property);
            }
        }
    }, [values]);
    useDebounce(values, doUpdate);

    useEffect(() => {
        if (values.id && onError) {
            const error1 = Boolean(Object.keys(errors).length ?? false);
            console.log("onError", error1, errors);
            onError(values.id, error1);
        }
    }, [errors]);

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
    } else if (selectedWidgetId === "select" ||
        selectedWidgetId === "number_select") {
        childComponent = <EnumPropertyField
            multiselect={false}
            updateIds={!existing}/>;
    } else if (selectedWidgetId === "multi_select" ||
        selectedWidgetId === "multi_number_select") {
        childComponent = <EnumPropertyField
            multiselect={true}
            updateIds={!existing}/>;
    } else {
        childComponent = <Box>
            {values?.title}
        </Box>;
    }

    const Icon = selectedWidget?.icon;

    const title = "title";
    const titleError = showErrors && getIn(errors, title);

    const id = "id";
    const idError = showErrors && getIn(errors, id);

    useEffect(() => {
        const idTouched = getIn(touched, id);
        if (!idTouched && !existing && values.title) {
            setFieldValue(id, toSnakeCase(values.title))
        }

    }, [existing, touched, values.title]);

    return (
        <Grid container spacing={2} direction={"column"}>

            <Grid item>
                <Field name={title}
                       as={TextField}
                       validate={validateTitle}
                       label={"Title"}
                       required
                       fullWidth
                       helperText={titleError}
                       error={Boolean(titleError)}/>
            </Grid>

            <Grid item>
                <Field name={id}
                       as={TextField}
                       label={"Id"}
                       validate={validateId}
                       disabled={existing}
                       required
                       fullWidth
                       helperText={idError}
                       size="small"
                       error={Boolean(idError)}/>

            </Grid>

            <Grid item>
                <Select fullWidth
                        value={selectedWidgetId}
                        title={"Component"}
                        disabled={existing}
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

            {childComponent}

        </Grid>
    );
}

const idRegEx = /^(?:[a-zA-Z]+_)*[a-zA-Z0-9]+$/;

function validateId(value: string) {

    let error;
    if (!value) {
        error = "You must specify an id for the property";
    }
    if (!value.match(idRegEx)) {
        error = "The id can only contain letters, numbers and underscores (_), and not start with a number";
    }
    return error;
}

function validateTitle(value: string) {
    let error;
    if (!value) {
        error = "You must specify a title for the property";
    }
    return error;
}
