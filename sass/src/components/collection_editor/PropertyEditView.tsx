import React, {
    useCallback,
    useDeferredValue,
    useEffect,
    useState
} from "react";

import { Form, Formik, FormikErrors, FormikProps, getIn } from "formik";
import equal from "react-fast-compare"
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import {
    buildProperty,
    CustomDialogActions,
    DeleteConfirmationDialog,
    getBadgeForWidget,
    getWidget,
    getWidgetId,
    mergeDeep,
    Property,
    removeUndefined,
    ResolvedProperty,
    toSnakeCase,
    WidgetId,
    WIDGETS
} from "@camberi/firecms";
import { EnumPropertyField } from "./properties/EnumPropertyField";
import { StoragePropertyField } from "./properties/StoragePropertyField";
import { MapPropertyField } from "./properties/MapPropertyField";
import { RepeatPropertyField } from "./properties/RepeatPropertyField";
import { BasePropertyField } from "./properties/BasePropertyField";
import { StringPropertyField } from "./properties/StringPropertyField";
import { BooleanPropertyField } from "./properties/BooleanPropertyField";
import { BlockPropertyField } from "./properties/BlockPropertyField";
import { NumberPropertyField } from "./properties/NumberPropertyField";
import { ReferencePropertyField } from "./properties/ReferencePropertyField";
import { DateTimePropertyField } from "./properties/DateTimePropertyField";

export type PropertyWithId = ResolvedProperty & { id?: string };

export function PropertyForm({
                                 asDialog,
                                 open,
                                 includeIdAndName = true,
                                 existing,
                                 inArray,
                                 propertyKey,
                                 propertyNamespace,
                                 property,
                                 onOkClicked,
                                 onCancel,
                                 onPropertyChanged,
                                 onDelete,
                                 onError,
                                 initialErrors,
                                 forceShowErrors,
                                 existingPropertyKeys
                             }: {
    asDialog: boolean;
    open?: boolean;
    includeIdAndName?: boolean;
    existing: boolean;
    inArray: boolean;
    propertyKey?: string;
    propertyNamespace?: string;
    property?: Property;
    onPropertyChanged: (params: { id?: string, property: Property, namespace?: string }) => void;
    onDelete?: (id?: string, namespace?: string) => void;
    onError?: (id: string, namespace?: string, error?: FormikErrors<any>) => void;
    onOkClicked?: () => void;
    onCancel?: () => void;
    initialErrors?: FormikErrors<any>;
    forceShowErrors: boolean;
    existingPropertyKeys?: string[];
}) {

    const initialValue: PropertyWithId = {
        id: "",
        name: ""
    } as PropertyWithId;

    const disabled = Boolean(property) && !property?.editable;

    return (
        <Formik
            key={`property_view_${propertyKey}`}
            initialErrors={initialErrors}
            initialValues={property
                ? { id: propertyKey, ...property } as PropertyWithId
                : initialValue}
            onSubmit={(newPropertyWithId: PropertyWithId, formikHelpers) => {
                const { id, ...property } = newPropertyWithId;
                onPropertyChanged({
                    id,
                    property,
                    namespace: propertyNamespace
                });
                if (!existing)
                    formikHelpers.resetForm({ values: initialValue });
                if (onOkClicked) {
                    onOkClicked();
                }
            }}
            validate={(values) => {
                const errors: any = {};
                if (!values.dataType || !getWidget(values)) {
                    errors.selectedWidget = "Required";
                }
                if (existingPropertyKeys && values.id && existingPropertyKeys.includes(values.id)) {
                    errors.id = "";
                }
                return {};
            }}
        >
            {(props) => {
                const form = <PropertyEditView
                    onPropertyChanged={asDialog ? undefined : onPropertyChanged}
                    onDelete={existing ? onDelete : undefined}
                    includeIdAndTitle={includeIdAndName}
                    propertyNamespace={propertyNamespace}
                    onError={onError}
                    showErrors={forceShowErrors || props.submitCount > 0}
                    existing={existing}
                    inArray={inArray}
                    existingPropertyKeys={existingPropertyKeys}
                    disabled={disabled}
                    {...props}/>;

                let body: JSX.Element;
                if (asDialog) {
                    body =
                        <Dialog
                            keepMounted={false}
                            open={open ?? false}
                            maxWidth={"sm"}
                            fullWidth
                            sx={{
                                height: "100vh"
                            }}>
                            <Form noValidate>
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
                                            type="submit">
                                        Ok
                                    </Button>
                                </CustomDialogActions>
                            </Form>
                        </Dialog>;
                } else {
                    body = <Box p={1}>{form}</Box>;
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
                editable: true,
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
                editable: true,
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
                editable: true,
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
                editable: true,
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
                editable: true,
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
                editable: true,
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
                editable: true,
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
                editable: true,
                enumValues: undefined
            })
        );
    } else if (selectedWidgetId === "number_select") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "number",
                editable: true,
                enumValues: propertyData.enumValues ?? []
            })
        );
    } else if (selectedWidgetId === "multi_number_select") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                editable: true,
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
                editable: true,
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
                editable: true,
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
                editable: true,
                properties: propertyData.properties ?? {}
            })
        );
    } else if (selectedWidgetId === "reference") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                // @ts-ignore
                dataType: "reference",
                editable: true
            })
        );
    } else if (selectedWidgetId === "multi_references") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                editable: true,
                // @ts-ignore
                of: {
                    dataType: "reference"
                }
            })
        );
    } else if (selectedWidgetId === "switch") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "boolean",
                editable: true
            })
        );
    } else if (selectedWidgetId === "date_time") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "date",
                editable: true,
                mode: "date_time"
            })
        );
    } else if (selectedWidgetId === "repeat") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                editable: true
            })
        );
    } else if (selectedWidgetId === "block") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
                editable: true,
                oneOf: {
                    properties: {}
                }
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
                              includeIdAndTitle,
                              onPropertyChanged,
                              onDelete,
                              propertyNamespace,
                              onError,
                              showErrors,
                              disabled,
                              inArray,
                              existingPropertyKeys
                          }: {
    includeIdAndTitle?: boolean;
    existing: boolean;
    propertyNamespace?: string;
    onPropertyChanged?: (params: { id?: string, property: Property, namespace?: string }) => void;
    onDelete?: (id?: string, namespace?: string) => void;
    onError?: (id: string, namespace?: string, error?: FormikErrors<any>) => void;
    showErrors: boolean;
    inArray: boolean;
    disabled: boolean;
    existingPropertyKeys?: string[];
} & FormikProps<PropertyWithId>) {

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedWidgetId, setSelectedWidgetId] = useState<WidgetId | undefined>(values?.dataType ? getWidgetId(values) : undefined);

    const displayedWidgets = inArray
        ? Object.entries(WIDGETS).filter(([_, widget]) => widget.dataType !== "array")
        : Object.entries(WIDGETS);
    const selectedWidget = selectedWidgetId ? WIDGETS[selectedWidgetId] : undefined;

    const deferredValues = useDeferredValue(values);

    React.useEffect(() => {
        if (onPropertyChanged) {
            if ((!includeIdAndTitle || deferredValues.id)) {
                const { id, ...property } = deferredValues;
                onPropertyChanged({
                    id,
                    property,
                    namespace: propertyNamespace
                });
            }
        }
    }, [deferredValues, includeIdAndTitle, onPropertyChanged, propertyNamespace]);

    useEffect(() => {
        if (values.id && onError) {
            onError(values.id, propertyNamespace, errors);
        }
    }, [errors]);

    const onWidgetSelectChanged = useCallback((newSelectedWidgetId: WidgetId) => {
        setSelectedWidgetId(newSelectedWidgetId);
        updateSelectedWidget(values, newSelectedWidgetId, setValues);
    }, [setValues, values]);

    let childComponent;
    if (selectedWidgetId === "text_field" ||
        selectedWidgetId === "multiline" ||
        selectedWidgetId === "markdown" ||
        selectedWidgetId === "url" ||
        selectedWidgetId === "email") {
        childComponent =
            <StringPropertyField widgetId={selectedWidgetId}
                                 disabled={disabled}
                                 showErrors={showErrors}/>;
    } else if (selectedWidgetId === "select" ||
        selectedWidgetId === "number_select") {
        childComponent = <EnumPropertyField
            multiselect={false}
            updateIds={!existing}
            disabled={disabled}
            showErrors={showErrors}/>;
    } else if (selectedWidgetId === "multi_select" ||
        selectedWidgetId === "multi_number_select") {
        childComponent = <EnumPropertyField
            multiselect={true}
            updateIds={!existing}
            disabled={disabled}
            showErrors={showErrors}/>;
    } else if (selectedWidgetId === "file_upload") {
        childComponent =
            <StoragePropertyField existing={existing}
                                  multiple={false}
                                  disabled={disabled}/>;
    } else if (selectedWidgetId === "multi_file_upload") {
        childComponent =
            <StoragePropertyField existing={existing}
                                  multiple={true}
                                  disabled={disabled}/>;
    } else if (selectedWidgetId === "switch") {
        childComponent = <BooleanPropertyField disabled={disabled}/>;
    } else if (selectedWidgetId === "number_input") {
        childComponent = <NumberPropertyField disabled={disabled}/>;
    } else if (selectedWidgetId === "group") {
        childComponent = existing && <MapPropertyField disabled={disabled}/>;
    } else if (selectedWidgetId === "block") {
        childComponent = existing && <BlockPropertyField disabled={disabled}/>;
    } else if (selectedWidgetId === "reference") {
        childComponent =
            <ReferencePropertyField existing={existing}
                                    multiple={false}
                                    disabled={disabled}/>;
    } else if (selectedWidgetId === "date_time") {
        childComponent = <DateTimePropertyField disabled={disabled}/>;
    } else if (selectedWidgetId === "multi_references") {
        childComponent =
            <ReferencePropertyField existing={existing}
                                    multiple={true}
                                    disabled={disabled}/>;
    } else if (selectedWidgetId === "repeat") {
        childComponent =
            <RepeatPropertyField showErrors={showErrors}
                                 existing={existing}
                                 disabled={disabled}/>;
    } else {
        childComponent = null;
    }

    const id = "id";

    const selectedWidgetError = showErrors && getIn(errors, "selectedWidget");

    useEffect(() => {
        const idTouched = getIn(touched, id);
        if (!idTouched && !existing && values.name) {
            setFieldValue(id, toSnakeCase(values.name))
        }

    }, [existing, touched, values.name]);

    return (
        <>
            {!existing && <Typography variant={"h5"} sx={{
                my: 3
            }}>New property</Typography>}
            <Box sx={{
                display: "flex",
                mt: 2,
                justifyContent: "space-between"
            }}>
                <FormControl fullWidth
                             error={Boolean(selectedWidgetError)}>
                    <InputLabel id="component-label">Field</InputLabel>
                    <Select fullWidth
                            defaultOpen={!existing}
                            labelId="component-label"
                            value={selectedWidgetId ?? ""}
                            label={"Field"}
                            disabled={existing}
                            required
                            startAdornment={selectedWidget
                                ? <Box mr={2}>
                                    {getBadgeForWidget(selectedWidget)}
                                </Box>
                                : undefined}
                            renderValue={(value) => {
                                if (!value) {
                                    return <em>Select a property widget</em>;
                                }
                                return WIDGETS[value].name;
                            }}
                            onChange={(e) => onWidgetSelectChanged(e.target.value as WidgetId)}>

                        {displayedWidgets.map(([key, widget]) =>
                            (
                                <MenuItem value={key} key={key}>
                                    <Box mr={3}>
                                        <p>{getBadgeForWidget(widget)}</p>
                                    </Box>
                                    <Box>
                                        <div>{widget.name}</div>
                                        <Typography variant={"caption"}
                                                    color={"text.disabled"}>
                                            {widget.description}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                    </Select>
                    {selectedWidgetError &&
                        <FormHelperText>Required</FormHelperText>}
                </FormControl>

                {onDelete && values.id &&
                    <Button
                        sx={{
                            color: "#888",
                            ml: 2
                        }}
                        disabled={disabled}
                        startIcon={<DeleteIcon/>}
                        onClick={() => setDeleteDialogOpen(true)}>
                        Remove
                    </Button>}
            </Box>

            <Box mt={3} mb={2}>
                {includeIdAndTitle &&
                    <Grid container spacing={2} direction={"column"} sx={{
                        pb: 4,
                        pt: 2
                    }}>
                        <BasePropertyField showErrors={showErrors}
                                           disabledId={existing}
                                           existingPropertyKeys={existingPropertyKeys}
                                           disabled={disabled}/>

                    </Grid>}
                <Grid container spacing={2} direction={"column"}>
                    {childComponent}
                </Grid>
            </Box>

            {onDelete &&
                <DeleteConfirmationDialog open={deleteDialogOpen}
                                          onAccept={() => onDelete(values.id, propertyNamespace)}
                                          onCancel={() => setDeleteDialogOpen(false)}
                                          title={<>Delete this property?</>}
                                          body={
                                              <> This will <b>not delete any
                                                  data</b>, only modify the
                                                  collection.</>
                                          }/>}

        </>
    );
}
