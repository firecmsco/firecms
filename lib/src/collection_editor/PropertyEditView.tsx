import React, { useEffect, useState } from "react";

import { Form, Formik, FormikProps, getIn } from "formik";
import equal from "react-fast-compare"
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Tab,
    Tabs,
    Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { Property } from "../models";
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
import { MapPropertyField } from "./properties/MapPropertyField";
import { RepeatPropertyField } from "./properties/RepeatPropertyField";
import { getBadgeForWidget } from "../core/util/property_utils";
import { BasePropertyField } from "./properties/BasePropertyField";
import {
    StringPropertyFieldAdvanced
} from "./properties_advanced/StringPropertyFieldAdvanced";
import {
    EnumPropertyFieldAdvanced
} from "./properties_advanced/EnumPropertyFieldAdvanced";
import {
    FieldUploadPropertyFieldAdvanced
} from "./properties_advanced/FieldUploadPropertyFieldAdvanced";
import {
    BooleanPropertyFieldAdvanced
} from "./properties_advanced/BooleanPropertyFieldAdvanced";
import {
    ArrayPropertyFieldAdvanced
} from "./properties_advanced/ArrayPropertyFieldAdvanced";
import { BlockPropertyField } from "./properties/BlockPropertyField";
import {
    DeleteConfirmationDialog
} from "../core/components/DeleteConfirmationDialog";
import {
    NumberPropertyFieldAdvanced
} from "./properties_advanced/NumberPropertyFieldAdvanced";
import { ReferencePropertyField } from "./properties/ReferencePropertyField";
import { DateTimePropertyField } from "./properties/DateTimePropertyField";
import {
    DateTimePropertyFieldAdvanced
} from "./properties_advanced/DateTimePropertyFieldAdvanced";

export type PropertyWithId = Property & { id?: string };

export function PropertyForm({
                                 asDialog,
                                 open,
                                 includeIdAndName = true,
                                 existing,
                                 inArray,
                                 propertyId,
                                 propertyNamespace,
                                 property,
                                 onOkClicked,
                                 onCancel,
                                 onPropertyChanged,
                                 onDelete,
                                 onError,
                                 forceShowErrors,
                                 existingPropertyIds
                             }: {
    asDialog: boolean;
    open?: boolean;
    includeIdAndName?: boolean;
    existing: boolean;
    inArray: boolean;
    propertyId?: string;
    propertyNamespace?: string;
    property?: Property;
    onPropertyChanged: (params: { id?: string, property: Property, namespace?: string }) => void;
    onDelete?: (id?: string, namespace?: string) => void;
    onError?: (id: string, namespace?: string, error?: boolean) => void;
    onOkClicked?: () => void;
    onCancel?: () => void;
    forceShowErrors: boolean;
    existingPropertyIds?: string[];
}) {

    const initialValue: PropertyWithId = {
        id: "",
        name: ""
    } as PropertyWithId;

    return (
        <Formik
            key={`property_view_${propertyId}`}
            initialValues={property
                ? { id: propertyId, ...property } as PropertyWithId
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
                if (existingPropertyIds && values.id && existingPropertyIds.includes(values.id)) {
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
                    existingPropertyIds={existingPropertyIds}
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
                dataType: "date",
                mode: "date_time"
            })
        );
    } else if (selectedWidgetId === "repeat") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array"
            })
        );
    } else if (selectedWidgetId === "block") {
        updatedProperty = mergeDeep(
            propertyData,
            buildProperty({
                dataType: "array",
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
                              inArray,
                              existingPropertyIds
                          }: {
    includeIdAndTitle?: boolean;
    existing: boolean;
    propertyNamespace?: string;
    onPropertyChanged?: (params: { id?: string, property: Property, namespace?: string }) => void;
    onDelete?: (id?: string, namespace?: string) => void;
    onError?: (id: string, namespace?: string, error?: boolean) => void;
    showErrors: boolean;
    inArray: boolean;
    existingPropertyIds?: string[];
} & FormikProps<PropertyWithId>) {

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedWidgetId, setSelectedWidgetId] = useState<WidgetId | undefined>(values?.dataType ? getWidgetId(values) : undefined);

    const displayedWidgets = inArray
        ? Object.entries(WIDGETS).filter(([_, widget]) => widget.dataType !== "array")
        : Object.entries(WIDGETS);
    const selectedWidget = selectedWidgetId ? WIDGETS[selectedWidgetId] : undefined;

    const initialValuesRef = React.useRef(values);

    const doUpdate = React.useCallback(() => {
        if (onPropertyChanged) {
            if ((!includeIdAndTitle || values.id) &&
                !equal(initialValuesRef.current, removeUndefined(values))) {
                const { id, ...property } = values;
                onPropertyChanged({
                    id,
                    property,
                    namespace: propertyNamespace
                });
            }
        }
    }, [values, propertyNamespace]);
    useDebounce(values, doUpdate);

    useEffect(() => {
        if (values.id && onError) {
            onError(values.id, propertyNamespace, Boolean(Object.keys(errors).length ?? false));
        }
    }, [errors]);

    useEffect(() => {
        updateSelectedWidget(values, selectedWidgetId, setValues);
    }, [selectedWidgetId]);

    let childComponent;
    let childComponentAdvanced;
    if (selectedWidgetId === "text_field" ||
        selectedWidgetId === "multiline" ||
        selectedWidgetId === "markdown" ||
        selectedWidgetId === "url" ||
        selectedWidgetId === "email") {
        childComponentAdvanced =
            <StringPropertyFieldAdvanced widgetId={selectedWidgetId}/>;
    } else if (selectedWidgetId === "select" ||
        selectedWidgetId === "number_select") {
        childComponent = <EnumPropertyField
            multiselect={false}
            updateIds={!existing}/>;
        childComponentAdvanced = <EnumPropertyFieldAdvanced
            multiselect={false}
            updateIds={!existing}/>;
    } else if (selectedWidgetId === "multi_select" ||
        selectedWidgetId === "multi_number_select") {
        childComponent = <EnumPropertyField
            multiselect={true}
            updateIds={!existing}/>;
        childComponentAdvanced = <EnumPropertyFieldAdvanced
            multiselect={true}
            updateIds={!existing}/>;
    } else if (selectedWidgetId === "file_upload") {
        childComponent = <FieldUploadPropertyField multiple={false}/>;
        childComponentAdvanced =
            <FieldUploadPropertyFieldAdvanced multiple={false} existing={existing}/>;
    } else if (selectedWidgetId === "multi_file_upload") {
        childComponent = <FieldUploadPropertyField multiple={true}/>;
        childComponentAdvanced =
            <FieldUploadPropertyFieldAdvanced multiple={true} existing={existing}/>;
    } else if (selectedWidgetId === "switch") {
        childComponentAdvanced = <BooleanPropertyFieldAdvanced/>;
    } else if (selectedWidgetId === "number_input") {
        childComponentAdvanced = <NumberPropertyFieldAdvanced/>;
    } else if (selectedWidgetId === "group") {
        childComponent = existing && <MapPropertyField/>;
    } else if (selectedWidgetId === "block") {
        childComponent = existing && <BlockPropertyField/>;
    } else if (selectedWidgetId === "reference") {
        childComponent =
            <ReferencePropertyField existing={existing} multiple={false}/>;
    } else if (selectedWidgetId === "date_time") {
        childComponent = <DateTimePropertyField/>;
        childComponentAdvanced = <DateTimePropertyFieldAdvanced/>
    } else if (selectedWidgetId === "multi_references") {
        childComponent =
            <ReferencePropertyField existing={existing} multiple={true}/>;
    } else if (selectedWidgetId === "repeat") {
        childComponent =
            <RepeatPropertyField showErrors={showErrors} existing={existing}/>;
        childComponentAdvanced =
            <ArrayPropertyFieldAdvanced showErrors={showErrors}
                                        existing={existing}/>;
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

    const [tabPosition, setTabPosition] = React.useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabPosition(newValue);
    };

    const hasBasicTab = Boolean(childComponent) || includeIdAndTitle;
    const hasAdvancedTab = Boolean(childComponentAdvanced);

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
                            onChange={(e) => setSelectedWidgetId(e.target.value as WidgetId)}>

                        {displayedWidgets.map(([key, widget]) => {
                            return (
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
                            );
                        })}
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
                        startIcon={<DeleteIcon/>}
                        onClick={() => setDeleteDialogOpen(true)}>
                        Remove
                    </Button>}
            </Box>

            <Tabs
                value={!hasBasicTab || !hasAdvancedTab ? false : tabPosition}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                    mt: 1
                }}
            >
                {hasBasicTab && <Tab label="Configuration"
                                     disabled={!hasAdvancedTab}/>}
                {hasAdvancedTab && <Tab label="Advanced"
                                        disabled={!hasBasicTab}/>}
            </Tabs>

            <Divider/>

            <Box mt={3} mb={2}>
                <Box
                    hidden={tabPosition !== 0 && hasAdvancedTab}>
                    <Grid container spacing={2} direction={"column"}>
                        {includeIdAndTitle &&
                            <BasePropertyField showErrors={showErrors}
                                               disabledId={existing}
                                               existingPropertyIds={existingPropertyIds}/>}
                        {childComponent}
                    </Grid>
                </Box>

                <Box hidden={tabPosition !== 1 && hasBasicTab}>
                    <Grid container spacing={2} direction={"column"}>
                        {childComponentAdvanced}
                    </Grid>
                </Box>
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
