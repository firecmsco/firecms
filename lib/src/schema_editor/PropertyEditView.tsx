import React, { useEffect, useState } from "react";

import { Field, Formik, FormikProps, getIn } from "formik";
import equal from "react-fast-compare"
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    FormHelperText,
    Grid,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { Property } from "../models";
import { StringPropertyField } from "./properties/StringPropertyField";
import {
    getWidget,
    getWidgetId,
    WidgetId,
    WIDGETS
} from "../core/util/widgets";
import { buildProperty } from "../core";
import { EnumPropertyField } from "./properties/EnumPropertyField";
import { toSnakeCase } from "../core/util/strings";
import { useDebounce } from "../core/internal/useDebounce";
import { CustomDialogActions } from "../core/components/CustomDialogActions";
import { mergeDeep, removeUndefined } from "../core/util/objects";
import {
    FieldUploadPropertyField
} from "./properties/FieldUploadPropertyField";
import DebouncedTextField from "../form/components/DebouncedTextField";
import { BooleanPropertyField } from "./properties/BooleanPropertyField";
import { MapPropertyField } from "./properties/MapPropertyField";

type PropertyWithId = Property & { id: string };

export function PropertyForm({
                                 asDialog,
                                 open,
                                 propertyId,
                                 propertyNamespace,
                                 property,
                                 onOkClicked,
                                 onCancel,
                                 onPropertyChanged,
                                 onDelete,
                                 onError,
                                 forceShowErrors
                             }: {
    asDialog: boolean;
    open?: boolean;
    propertyId?: string;
    propertyNamespace?: string;
    property?: Property;
    onPropertyChanged: (id: string, property: Property, namespace?: string) => void;
    onDelete?: (id: string, namespace?: string) => void;
    onError?: (id: string, error: boolean) => void;
    onOkClicked?: () => void;
    onCancel?: () => void;
    forceShowErrors: boolean;
}) {

    const existing = Boolean(propertyId);
    const initialValue: PropertyWithId = {
        id: "",
        title: ""
    } as PropertyWithId;

    return (
        <Formik
            initialValues={property
                ? { id: propertyId, ...property } as PropertyWithId
                : initialValue}
            onSubmit={(newPropertyWithId: PropertyWithId, formikHelpers) => {
                const { id, ...property } = newPropertyWithId;
                onPropertyChanged(id, property, propertyNamespace);
                if (!existing)
                    formikHelpers.resetForm({ values: initialValue });
                if (onOkClicked) {
                    onOkClicked();
                }
            }}
            validate={(values) => {
                if (!getWidget(values)) {
                    return { selectedWidget: "Required" }
                }
                return {};
            }}
        >
            {(props) => {

                const form = <PropertyEditView
                    onPropertyChanged={asDialog ? undefined : onPropertyChanged}
                    onDelete={existing ? onDelete : undefined}
                    propertyNamespace={propertyNamespace}
                    onError={onError}
                    showErrors={forceShowErrors || props.submitCount > 0}
                    existing={existing}
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
                return body;
            }}

        </Formik>

    );

}

function updateSelectedWidget(propertyData: any, selectedWidgetId: WidgetId | undefined, setValues: any) {
    let updatedProperty;
    if (selectedWidgetId === "text_field") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enumValues: undefined
            })
        );
    } else if (selectedWidgetId === "multiline") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                multiline: true,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enumValues: undefined
            })
        );
    } else if (selectedWidgetId === "markdown") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                multiline: undefined,
                markdown: true,
                email: undefined,
                url: undefined
            })
        );
    } else if (selectedWidgetId === "url") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: true,
                enumValues: undefined
            })
        );
    } else if (selectedWidgetId === "email") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                multiline: undefined,
                markdown: undefined,
                email: true,
                url: undefined,
                enumValues: undefined
            })
        );
    } else if (selectedWidgetId === "select") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                multiline: undefined,
                markdown: undefined,
                email: undefined,
                url: undefined,
                enumValues: propertyData.enumValues ?? []
            })
        );
    } else if (selectedWidgetId === "multi_select") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                of: {
                    dataType: "string",
                    enumValues: propertyData.of?.enumValues ?? []
                }
            })
        );
    } else if (selectedWidgetId === "number_input") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "number",
                enumValues: undefined
            })
        );
    } else if (selectedWidgetId === "number_select") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "number",
                enumValues: propertyData.enumValues ?? []
            })
        );
    } else if (selectedWidgetId === "multi_number_select") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                of: {
                    dataType: "number",
                    enumValues: propertyData.of?.enumValues ?? []
                }
            })
        );
    } else if (selectedWidgetId === "file_upload") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "string",
                storage: {
                    storagePath: "/"
                }
            })
        );
    } else if (selectedWidgetId === "multi_file_upload") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                of: {
                    dataType: "string",
                    storage: propertyData.of?.storage ?? {
                        storagePath: "/"
                    }
                }
            })
        );
    } else if (selectedWidgetId === "group") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "map",
                properties: propertyData.properties ?? {}
            })
        );
    } else if (selectedWidgetId === "reference") {
        updatedProperty = mergeDeep(
            propertyData,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            buildProperty({
                dataType: "reference"
            })
        );
    } else if (selectedWidgetId === "multi_references") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                of: {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    dataType: "reference"
                }
            })
        );
    } else if (selectedWidgetId === "switch") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "boolean"
            })
        );
    } else if (selectedWidgetId === "date_time") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "date"
            })
        );
    } else if (selectedWidgetId === "repeat") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array"
            })
        );
    }

    if (updatedProperty) {
        setValues(updatedProperty);
    }
}

function PropertyEditView({
                              values,
                              errors,
                              touched,
                              setValues,
                              setFieldValue,
                              existing,
                              onPropertyChanged,
                              onDelete,
                              propertyNamespace,
                              onError,
                              showErrors
                          }: {
    existing: boolean;
    propertyNamespace?: string;
    onPropertyChanged?: (id: string, property: Property, namespace?: string) => void;
    onDelete?: (id: string, namespace?: string) => void;
    onError?: (id: string, error: boolean) => void;
    showErrors: boolean;
} & FormikProps<PropertyWithId>) {

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedWidgetId, setSelectedWidgetId] = useState<WidgetId | undefined>(values ? getWidgetId(values) : undefined);

    const selectedWidget = selectedWidgetId ? WIDGETS[selectedWidgetId] : undefined;

    const initialValuesRef = React.useRef(values);

    const doUpdate = React.useCallback(() => {
        if (onPropertyChanged) {
            if (values.id && !equal(initialValuesRef.current, removeUndefined(values))) {
                const { id, ...property } = values;
                onPropertyChanged(id, property, propertyNamespace);
            }
        }
    }, [values, propertyNamespace]);
    useDebounce(values, doUpdate);

    useEffect(() => {
        if (values.id && onError) {
            onError(values.id, Boolean(Object.keys(errors).length ?? false));
        }
    }, [errors]);

    useEffect(() => {
        updateSelectedWidget(values, selectedWidgetId, setValues);
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
    } else if (selectedWidgetId === "file_upload") {
        childComponent = <FieldUploadPropertyField multiple={false}/>;
    } else if (selectedWidgetId === "multi_file_upload") {
        childComponent = <FieldUploadPropertyField multiple={true}/>;
    } else if (selectedWidgetId === "switch") {
        childComponent = <BooleanPropertyField/>;
    } else if (selectedWidgetId === "group") {
        childComponent = <MapPropertyField existing={existing}/>;
    } else {
        childComponent = null;
    }

    const Icon = selectedWidget?.icon;

    const title = "title";
    const titleError = showErrors && getIn(errors, title);

    const id = "id";
    const idError = showErrors && getIn(errors, id);

    const selectedWidgetError = showErrors && getIn(errors, "selectedWidget");

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
                       as={DebouncedTextField}
                       validate={validateTitle}
                       label={"Property title"}
                       required
                       fullWidth
                       helperText={titleError}
                       error={Boolean(titleError)}/>
            </Grid>

            <Grid item>
                <Box sx={{ display: "flex", flexDirection: "row" }}>
                    <Field name={id}
                           as={TextField}
                           label={"ID"}
                           validate={validateId}
                           disabled={existing}
                           required
                           fullWidth
                           helperText={idError}
                           size="small"
                           error={Boolean(idError)}/>

                    {onDelete && values.id &&
                        <Button
                            sx={{
                                color: "#888",
                                ml: 2
                            }}
                            startIcon={<DeleteIcon/>}
                            onClick={() => setDeleteDialogOpen(true)}>
                            Remove
                        </Button>}
                </Box>
            </Grid>

            <Grid item>
                <FormControl fullWidth
                             error={Boolean(selectedWidgetError)}>
                    <InputLabel id="component-label">Component</InputLabel>
                    <Select fullWidth
                            labelId="component-label"
                            value={selectedWidgetId}
                            label={"Component"}
                            disabled={existing}
                            required
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
                    {selectedWidgetError &&
                        <FormHelperText>Required</FormHelperText>}
                </FormControl>

            </Grid>

            {childComponent}

            {onDelete && <DeleteConfirmationDialog open={deleteDialogOpen}
                                                   onAccept={() => onDelete(values.id, propertyNamespace)}
                                                   onCancel={() => setDeleteDialogOpen(false)}/>}

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

function DeleteConfirmationDialog({
                                      open,
                                      onAccept,
                                      onCancel
                                  }: { open: boolean, onAccept: () => void, onCancel: () => void }) {
    return <Dialog
        open={open}
        onClose={onCancel}
    >
        <DialogTitle>
            {"Delete this property?"}
        </DialogTitle>
        {/*<DialogContent>*/}
        {/*    <DialogContentText>*/}
        {/*        You are moving one property from one context to*/}
        {/*        another.*/}
        {/*    </DialogContentText>*/}
        {/*    <DialogContentText>*/}
        {/*        This will <b>not transfer the data</b>, only modify*/}
        {/*        the schema.*/}
        {/*    </DialogContentText>*/}
        {/*</DialogContent>*/}
        <CustomDialogActions>
            <Button
                onClick={onCancel}
                autoFocus>Cancel</Button>
            <Button
                variant="contained"
                onClick={onAccept}>
                Ok
            </Button>
        </CustomDialogActions>
    </Dialog>;
}
