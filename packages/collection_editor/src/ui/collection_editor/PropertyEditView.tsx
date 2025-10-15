import React, { useDeferredValue, useEffect, useRef, useState } from "react";
import { deepEqual as equal } from "fast-equals"

import { Formex, FormexController, getIn, useCreateFormex } from "@firecms/formex";
import {
    ConfirmationDialog,
    DEFAULT_FIELD_CONFIGS,
    getFieldConfig,
    getFieldId,
    isPropertyBuilder,
    isValidRegExp,
    mergeDeep,
    Property,
    PropertyConfig,
    PropertyConfigBadge,
    PropertyConfigId,
} from "@firecms/core";
import {
    Button,
    Card,
    cls,
    DeleteIcon,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    fieldBackgroundDisabledMixin,
    fieldBackgroundHoverMixin,
    fieldBackgroundMixin,
    IconButton,
    InfoLabel,
    Tooltip,
    Typography,
    WarningIcon
} from "@firecms/ui";
import { EnumPropertyField } from "./properties/EnumPropertyField";
import { StoragePropertyField } from "./properties/StoragePropertyField";
import { MapPropertyField } from "./properties/MapPropertyField";
import { RepeatPropertyField } from "./properties/RepeatPropertyField";
import { CommonPropertyFields } from "./properties/CommonPropertyFields";
import { StringPropertyField } from "./properties/StringPropertyField";
import { BooleanPropertyField } from "./properties/BooleanPropertyField";
import { BlockPropertyField } from "./properties/BlockPropertyField";
import { NumberPropertyField } from "./properties/NumberPropertyField";
import { ReferencePropertyField } from "./properties/ReferencePropertyField";
import { DateTimePropertyField } from "./properties/DateTimePropertyField";
import { AdvancedPropertyValidation } from "./properties/advanced/AdvancedPropertyValidation";
import { editableProperty } from "../../utils/entities";
import { KeyValuePropertyField } from "./properties/KeyValuePropertyField";
import { updatePropertyFromWidget } from "./utils/update_property_for_widget";
import { UrlPropertyField } from "./properties/UrlPropertyField";
import { supportedFields } from "./utils/supported_fields";
import { MarkdownPropertyField } from "./properties/MarkdownPropertyField";

export type PropertyWithId = Property & {
    id?: string
};

export type OnPropertyChangedParams = {
    id?: string,
    property: Property,
    namespace?: string,
    previousId?: string
};

export type PropertyFormProps = {
    includeIdAndName?: boolean;
    existingProperty: boolean;
    autoUpdateId?: boolean;
    autoOpenTypeSelect: boolean;
    inArray: boolean;
    propertyKey?: string;
    propertyNamespace?: string;
    property?: Property;
    onPropertyChanged?: (params: OnPropertyChangedParams) => void;
    onPropertyChangedImmediate?: boolean;
    onDismiss?: () => void;
    onDelete?: (id?: string, namespace?: string) => void;
    onError?: (id: string, namespace?: string, error?: Record<string, any>) => void;
    initialErrors?: Record<string, any>;
    existingPropertyKeys?: string[];
    forceShowErrors?: boolean;
    allowDataInference: boolean;
    getData?: () => Promise<object[]>;
    getController?: (formex: FormexController<PropertyWithId>) => void;
    propertyConfigs: Record<string, PropertyConfig>;
    collectionEditable: boolean;
};

export const PropertyForm = React.memo(
    function PropertyForm(props: PropertyFormProps) {

        const {
            includeIdAndName = true,
            autoOpenTypeSelect,
            existingProperty,
            autoUpdateId,
            inArray,
            propertyKey,
            existingPropertyKeys,
            propertyNamespace,
            property,
            onPropertyChanged,
            onPropertyChangedImmediate = true,
            onDismiss,
            onDelete,
            onError,
            initialErrors,
            forceShowErrors,
            allowDataInference,
            getController,
            getData,
            propertyConfigs,
            collectionEditable
        } = props;

        const initialValue: PropertyWithId = {
            id: "",
            name: ""
        } as PropertyWithId;

        const disabled = (Boolean(property && !editableProperty(property)) && !collectionEditable);

        const lastSubmittedProperty = useRef<OnPropertyChangedParams | undefined>(property ? {
            id: propertyKey,
            previousId: propertyKey,
            property
        } : undefined);

        const doOnPropertyChanged = ({
                                         id,
                                         property
                                     }: OnPropertyChangedParams) => {
            const params = {
                id,
                previousId: lastSubmittedProperty.current?.id,
                property,
                namespace: propertyNamespace
            };
            lastSubmittedProperty.current = params;
            onPropertyChanged?.(params);
        };

        const formexController = useCreateFormex<PropertyWithId>({
            debugId: "PROPERTY_FORM",
            initialValues: property
                ? { id: propertyKey, ...property } as PropertyWithId
                : initialValue,
            initialErrors,
            validateOnChange: true,
            validateOnInitialRender: true,
            onSubmit: (newPropertyWithId, controller) => {
                const {
                    id,
                    ...property
                } = newPropertyWithId;
                doOnPropertyChanged({
                    id,
                    property: {
                        ...property,
                        editable: property.editable ?? true
                    }
                });
                if (!existingProperty)
                    controller.resetForm({ values: initialValue });
            },
            validation: (values) => {
                const errors: Record<string, any> = {};
                if (includeIdAndName) {
                    if (!values.name) {
                        errors.name = "Required";
                    } else {
                        const nameError = validateName(values.name);
                        if (nameError)
                            errors.name = nameError;
                    }
                    if (!values.id) {
                        errors.id = "Required";
                    } else {
                        const idError = validateId(values.id, existingPropertyKeys);
                        if (idError)
                            errors.id = idError;
                    }
                }

                if (values.type === "string") {
                    if (values.validation?.matches && !isValidRegExp(values.validation?.matches.toString())) {
                        errors.validation = {
                            matches: "Invalid regular expression"
                        }
                    }
                }
                if (values.type === "reference" && !values.path) {
                    errors.slug = "You must specify a target collection for the field";
                }
                if (values.propertyConfig === "repeat") {
                    if (!(values as any).of) {
                        errors.of = "You need to specify a repeat field";
                    }
                }
                if (values.propertyConfig === "block") {
                    if (!(values as any).oneOf) {
                        errors.oneOf = "You need to specify the properties of this block";
                    }
                }
                return errors;
            }
        });

        useEffect(() => {
            getController?.(formexController);
        }, [formexController, getController]);

        return <Formex value={formexController}>
            <PropertyEditFormFields
                onPropertyChanged={onPropertyChangedImmediate
                    ? doOnPropertyChanged
                    : undefined}
                onDelete={onDelete}
                includeIdAndTitle={includeIdAndName}
                propertyNamespace={propertyNamespace}
                onError={onError}
                onDismiss={onDismiss}
                showErrors={forceShowErrors || formexController.submitCount > 0}
                existing={existingProperty}
                autoUpdateId={autoUpdateId}
                inArray={inArray}
                autoOpenTypeSelect={autoOpenTypeSelect}
                disabled={disabled}
                getData={getData}
                allowDataInference={allowDataInference}
                propertyConfigs={propertyConfigs}
                collectionEditable={collectionEditable}
                {...formexController}/>
        </Formex>;
    }, (a, b) =>
        a.getData === b.getData &&
        a.propertyKey === b.propertyKey &&
        a.propertyNamespace === b.propertyNamespace &&
        a.includeIdAndName === b.includeIdAndName &&
        a.autoOpenTypeSelect === b.autoOpenTypeSelect &&
        a.autoUpdateId === b.autoUpdateId &&
        a.existingPropertyKeys === b.existingPropertyKeys &&
        a.existingProperty === b.existingProperty
);

export function PropertyFormDialog({
                                       open,
                                       onCancel,
                                       onOkClicked,
                                       onPropertyChanged,
                                       getData,
                                       collectionEditable,
                                       ...formProps
                                   }: PropertyFormProps & {
    open?: boolean;
    onOkClicked?: () => void;
    onCancel?: () => void;
}) {
    const formexRef = useRef<FormexController<PropertyWithId>>();
    const getController = (helpers: FormexController<PropertyWithId>) => {
        formexRef.current = helpers;
    };

    return <Dialog
        open={open ?? false}
        maxWidth={"xl"}
        fullWidth={true}
    >
        <form noValidate={true}
              autoComplete={"off"}
              onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  formexRef.current?.handleSubmit(e)
              }}>
            <DialogTitle hidden>Property edit view</DialogTitle>
            <DialogContent>

                <PropertyForm {...formProps}
                              onDismiss={onCancel}
                              onPropertyChanged={(params) => {
                                  onPropertyChanged?.(params);
                                  onOkClicked?.();
                              }}
                              collectionEditable={collectionEditable}
                              onPropertyChangedImmediate={false}
                              getController={getController}
                              getData={getData}
                />
            </DialogContent>

            <DialogActions>

                {onCancel && <Button
                    variant={"text"}
                    color={"primary"}
                    onClick={() => {
                        onCancel();
                        formexRef.current?.resetForm();
                    }}>
                    Cancel
                </Button>}

                <Button variant="outlined"
                        type={"submit"}
                        color="primary">
                    Ok
                </Button>
            </DialogActions>
        </form>
    </Dialog>;

}

function PropertyEditFormFields({
                                    values,
                                    errors,
                                    setValues,
                                    existing,
                                    autoUpdateId = false,
                                    autoOpenTypeSelect,
                                    includeIdAndTitle,
                                    onPropertyChanged,
                                    onDelete,
                                    propertyNamespace,
                                    onDismiss,
                                    onError,
                                    showErrors,
                                    disabled,
                                    inArray,
                                    getData,
                                    allowDataInference,
                                    propertyConfigs,
                                    collectionEditable
                                }: {
    includeIdAndTitle?: boolean;
    existing: boolean;
    autoUpdateId?: boolean;
    autoOpenTypeSelect: boolean;
    propertyNamespace?: string;
    onDismiss?: () => void;
    onPropertyChanged?: (params: OnPropertyChangedParams) => void;
    onDelete?: (id?: string, namespace?: string) => void;
    onError?: (id: string, namespace?: string, error?: Record<string, any>) => void;
    showErrors: boolean;
    inArray: boolean;
    disabled: boolean;
    getData?: () => Promise<object[]>;
    allowDataInference: boolean;
    propertyConfigs: Record<string, PropertyConfig>;
    collectionEditable: boolean;
} & FormexController<PropertyWithId>) {

    const [selectOpen, setSelectOpen] = useState(autoOpenTypeSelect);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedFieldConfigId, setSelectedFieldConfigId] = useState<string | undefined>(values?.type ? getFieldId(values) : undefined);

    const deferredValues = useDeferredValue(values);
    const nameFieldRef = useRef<HTMLInputElement>(null);

    const lastSubmittedProperty = useRef<object>(values);

    const selectedWidgetError = showErrors && getIn(errors, "selectedWidget");

    useEffect(() => {
        if (onPropertyChanged) {
            if ((!includeIdAndTitle || deferredValues.id)) {
                const {
                    id,
                    ...property
                } = deferredValues;
                if (!equal(deferredValues, lastSubmittedProperty.current)) {
                    onPropertyChanged({
                        id,
                        property,
                        namespace: propertyNamespace
                    });
                    lastSubmittedProperty.current = deferredValues;
                }
            }
        }
    }, [deferredValues, includeIdAndTitle, propertyNamespace]);

    useEffect(() => {
        if (values?.id && onError) {
            onError(values?.id, propertyNamespace, errors);
        }
    }, [errors, propertyNamespace, values?.id]);

    const onWidgetSelectChanged = (newSelectedWidgetId: PropertyConfigId) => {
        setSelectedFieldConfigId(newSelectedWidgetId);
        setValues(updatePropertyFromWidget(values, newSelectedWidgetId, propertyConfigs));
        // Ugly hack to autofocus the name field
        setTimeout(() => {
            nameFieldRef.current?.focus();
        }, 0);
    };

    let childComponent;
    if (selectedFieldConfigId === "text_field" ||
        selectedFieldConfigId === "multiline" ||
        selectedFieldConfigId === "user_select" ||
        selectedFieldConfigId === "email") {
        childComponent =
            <StringPropertyField widgetId={selectedFieldConfigId}
                                 disabled={disabled}
                                 showErrors={showErrors}/>;
    } else if (selectedFieldConfigId === "url") {
        childComponent =
            <UrlPropertyField disabled={disabled}
                              showErrors={showErrors}/>;
    } else if (selectedFieldConfigId === "markdown") {
        childComponent =
            <MarkdownPropertyField disabled={disabled}
                                   showErrors={showErrors}/>;
    } else if (selectedFieldConfigId === "select" ||
        selectedFieldConfigId === "number_select") {
        childComponent = <EnumPropertyField
            multiselect={false}
            allowDataInference={allowDataInference}
            updateIds={!existing}
            disabled={disabled}
            getData={getData}
            showErrors={showErrors}/>;
    } else if (selectedFieldConfigId === "multi_select" ||
        selectedFieldConfigId === "multi_number_select") {
        childComponent = <EnumPropertyField
            multiselect={true}
            updateIds={!existing}
            disabled={disabled}
            allowDataInference={allowDataInference}
            getData={getData}
            showErrors={showErrors}/>;
    } else if (selectedFieldConfigId === "file_upload") {
        childComponent =
            <StoragePropertyField existing={existing}
                                  multiple={false}
                                  disabled={disabled}/>;
    } else if (selectedFieldConfigId === "multi_file_upload") {
        childComponent =
            <StoragePropertyField existing={existing}
                                  multiple={true}
                                  disabled={disabled}/>;
    } else if (selectedFieldConfigId === "switch") {
        childComponent = <BooleanPropertyField disabled={disabled}/>;
    } else if (selectedFieldConfigId === "number_input") {
        childComponent = <NumberPropertyField disabled={disabled}/>;
    } else if (selectedFieldConfigId === "group") {
        childComponent =
            <MapPropertyField disabled={disabled} getData={getData} allowDataInference={allowDataInference}
                              collectionEditable={collectionEditable}
                              propertyConfigs={propertyConfigs}/>;
    } else if (selectedFieldConfigId === "block") {
        childComponent =
            <BlockPropertyField disabled={disabled} getData={getData} allowDataInference={allowDataInference}
                                collectionEditable={collectionEditable}
                                propertyConfigs={propertyConfigs}/>;
    } else if (selectedFieldConfigId === "reference") {
        childComponent =
            <ReferencePropertyField showErrors={showErrors}
                                    existing={existing}
                                    multiple={false}
                                    disabled={disabled}/>;
    } else if (selectedFieldConfigId === "reference_as_string") {
        childComponent =
            <ReferencePropertyField showErrors={showErrors}
                                    existing={existing}
                                    asString={true}
                                    multiple={false}
                                    disabled={disabled}/>;
    } else if (selectedFieldConfigId === "date_time") {
        childComponent = <DateTimePropertyField disabled={disabled}/>;
    } else if (selectedFieldConfigId === "multi_references") {
        childComponent =
            <ReferencePropertyField showErrors={showErrors}
                                    existing={existing}
                                    multiple={true}
                                    disabled={disabled}/>;
    } else if (selectedFieldConfigId === "repeat") {
        childComponent =
            <RepeatPropertyField showErrors={showErrors}
                                 existing={existing}
                                 getData={getData}
                                 allowDataInference={allowDataInference}
                                 disabled={disabled}
                                 collectionEditable={collectionEditable}
                                 propertyConfigs={propertyConfigs}/>;
    } else if (selectedFieldConfigId === "key_value") {
        childComponent =
            <KeyValuePropertyField disabled={disabled}/>;
    } else {
        childComponent = null;
    }

    return (
        <>
            {disabled && <InfoLabel mode={"warn"}>
                <Typography>This property can&apos;t be edited</Typography>
                <Typography variant={"caption"}>
                    You may not have permission to
                    edit it or it is defined in code with no <code>editable</code> flag
                </Typography>
            </InfoLabel>}

            <div className="flex mt-2 justify-between">
                <div className={"w-full flex flex-col gap-2"}>
                    <WidgetSelectView
                        initialProperty={values}
                        value={selectedFieldConfigId as PropertyConfigId}
                        onValueChange={(value) => onWidgetSelectChanged(value as PropertyConfigId)}
                        open={selectOpen}
                        onOpenChange={(open, hasValue) => {
                            if (!hasValue) {
                                onDismiss?.();
                            }
                            setSelectOpen(open);
                        }}
                        disabled={disabled}
                        showError={Boolean(selectedWidgetError)}
                        existing={existing}
                        propertyConfigs={propertyConfigs}
                        inArray={inArray}/>

                    {selectedWidgetError &&
                        <Typography variant="caption"
                                    className={"ml-3.5"}
                                    color={"error"}>Required</Typography>}

                    {/*<Typography variant="caption" className={"ml-3.5"}>Define your own custom properties and*/}
                    {/*    components</Typography>*/}

                </div>

                {onDelete && values?.id &&
                    <IconButton
                        variant={"ghost"}
                        className="m-4"
                        disabled={disabled}
                        onClick={() => setDeleteDialogOpen(true)}>
                        <DeleteIcon/>
                    </IconButton>}
            </div>

            <div className={"grid grid-cols-12 gap-y-12 mt-8 mb-8"}>
                {includeIdAndTitle &&
                    <CommonPropertyFields showErrors={showErrors}
                                          disabledId={existing}
                                          isNewProperty={!existing}
                                          disabled={disabled}
                                          autoUpdateId={autoUpdateId}
                                          ref={nameFieldRef}/>}

                {childComponent}

                <div className={"col-span-12"}>
                    <AdvancedPropertyValidation disabled={disabled}/>
                </div>
            </div>

            {onDelete &&
                <ConfirmationDialog open={deleteDialogOpen}
                                    onAccept={() => onDelete(values?.id, propertyNamespace)}
                                    onCancel={() => setDeleteDialogOpen(false)}
                                    title={<div>Delete this property?</div>}
                                    body={
                                        <div> This will <b>not delete any
                                            data</b>, only modify the
                                            collection.</div>
                                    }/>}

        </>
    );
}

const idRegEx = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function validateId(value?: string, existingPropertyKeys?: string[]) {

    let error;
    if (!value) {
        error = "You must specify an id for the field";
    }
    if (value && !value.match(idRegEx)) {
        error = "The id can only contain letters, numbers and underscores (_), and not start with a number";
    }
    if (value && existingPropertyKeys && existingPropertyKeys.includes(value)) {
        error = "There is another field with this ID already";
    }
    return error;
}

function validateName(value: string) {
    let error;
    if (!value) {
        error = "You must specify a title for the field";
    }
    return error;
}

const WIDGET_TYPE_MAP: Record<PropertyConfigId, string> = {
    text_field: "Text",
    multiline: "Text",
    markdown: "Text",
    url: "Text",
    email: "Text",
    switch: "Boolean",
    user_select: "Users",
    select: "Select",
    multi_select: "Select",
    number_input: "Number",
    number_select: "Select",
    multi_number_select: "Select",
    file_upload: "File",
    multi_file_upload: "File",
    relation: "Relation",
    reference: "Reference",
    reference_as_string: "Text",
    multi_references: "Reference",
    date_time: "Date",
    group: "Group",
    key_value: "Group",
    repeat: "Array",
    custom_array: "Array",
    block: "Group"
};

function WidgetSelectView({
                              initialProperty,
                              value,
                              onValueChange,
                              open,
                              onOpenChange,
                              disabled,
                              showError,
                              existing,
                              propertyConfigs,
                              inArray
                          }: {
    initialProperty?: PropertyWithId,
    value?: PropertyConfigId,
    onValueChange: (value: string) => void,
    showError: boolean,
    open: boolean,
    onOpenChange: (open: boolean, hasValue: boolean) => void,
    disabled: boolean,
    existing: boolean,
    propertyConfigs: Record<string, PropertyConfig>,
    inArray?: boolean
}) {

    const allSupportedFields = Object.entries(supportedFields).concat(Object.entries(propertyConfigs));

    const displayedWidgets = (inArray
        ? allSupportedFields.filter(([_, propertyConfig]) => !isPropertyBuilder(propertyConfig.property) && propertyConfig.property?.type !== "array")
        : allSupportedFields)
        .map(([key, propertyConfig]) => ({
            [key]: propertyConfig
        }))
        .reduce((a, b) => {
            return {
                ...a,
                ...b
            }
        }, {});

    const key = value;
    const propertyConfig = key ? (DEFAULT_FIELD_CONFIGS[key] ?? propertyConfigs[key]) : undefined;
    const baseProperty = propertyConfig?.property;
    const baseFieldConfig = baseProperty && !isPropertyBuilder(baseProperty) ? getFieldConfig(baseProperty, propertyConfigs) : undefined;
    const computedFieldConfig = baseFieldConfig && propertyConfig ? mergeDeep(baseFieldConfig, propertyConfig) : propertyConfig;

    const groups: string[] = [...new Set(Object.keys(displayedWidgets).map(key => {
        const group = WIDGET_TYPE_MAP[key as PropertyConfigId];
        if (group) {
            return group;
        }
        return "Custom/Other"
    }))];

    return <>
        <div
            onClick={() => {
                if (!disabled) {
                    onOpenChange(!open, Boolean(value));
                }
            }}
            className={cls(
                "select-none rounded-md text-sm p-4",
                fieldBackgroundMixin,
                disabled ? fieldBackgroundDisabledMixin : fieldBackgroundHoverMixin,
                "relative flex items-center",
            )}>
            {!value && <em>Select a property widget</em>}
            {value && computedFieldConfig && <div
                className={cls(
                    "flex items-center")}>
                <div className={"mr-8"}>
                    <PropertyConfigBadge propertyConfig={computedFieldConfig}/>
                </div>
                <div className={"flex flex-col items-start text-base text-left"}>
                    <div>{computedFieldConfig.name}</div>
                    <Typography variant={"caption"}
                                color={"secondary"}>
                        {computedFieldConfig.description}
                    </Typography>
                </div>
            </div>}
        </div>
        <Dialog open={open}
                onOpenChange={(open) => onOpenChange(open, Boolean(value))}
                maxWidth={"4xl"}>
            <DialogTitle>
                Select a property widget
            </DialogTitle>
            <DialogContent>
                <div>
                    {groups.map(group => {
                        return <div key={group} className={"mt-4"}>
                            <Typography variant={"label"}>{group}</Typography>
                            <div className={"grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4"}>
                                {Object.entries(displayedWidgets).map(([key, propertyConfig]) => {
                                    const groupKey = WIDGET_TYPE_MAP[key as PropertyConfigId];
                                    if (groupKey === group) {
                                        return <WidgetSelectViewItem
                                            key={key}
                                            initialProperty={initialProperty}
                                            onClick={() => {
                                                onValueChange(key);
                                                onOpenChange(false, true);
                                            }}
                                            propertyConfig={propertyConfig}
                                            existing={existing}/>;
                                    }
                                    return null;
                                })}
                            </div>
                        </div>;
                    })}
                    {/*{displayedWidgets.map(([key, propertyConfig]) => {*/}
                    {/*    return <WidgetSelectViewItem*/}
                    {/*        key={key}*/}
                    {/*        initialProperty={initialProperty}*/}
                    {/*        onClick={() => {*/}
                    {/*            onValueChange(key);*/}
                    {/*            onOpenChange(false);*/}
                    {/*        }}*/}
                    {/*        propertyConfig={propertyConfig}*/}
                    {/*        existing={existing}/>;*/}
                    {/*})}*/}
                </div>
            </DialogContent>
        </Dialog>
    </>;
}

export interface PropertySelectItemProps {
    onClick?: () => void;
    initialProperty?: PropertyWithId;
    propertyConfig: PropertyConfig;
    existing: boolean;
}

export function WidgetSelectViewItem({
                                         onClick,
                                         initialProperty,
                                         // optionDisabled,
                                         propertyConfig,
                                         existing
                                     }: PropertySelectItemProps) {
    const baseProperty = propertyConfig.property;
    const shouldWarnChangingtype = existing && !isPropertyBuilder(baseProperty) && baseProperty.type !== initialProperty?.type;

    return <Card
        onClick={onClick}
        className={"flex flex-row items-center px-4 py-2 m-1"}>
        <div
            className={cls(
                "flex flex-row items-center text-base min-h-[48px]",
            )}>
            <div className={"mr-8"}>
                <PropertyConfigBadge propertyConfig={propertyConfig} disabled={shouldWarnChangingtype}/>
            </div>
            <div>
                <div className={"flex flex-row gap-2 items-center"}>
                    {shouldWarnChangingtype && <Tooltip
                        title={"This widget uses a different data type than the initially selected widget. This can cause errors with existing data."}>
                        <WarningIcon size="smallest" className={"w-4"}/>
                    </Tooltip>}
                    <Typography
                        variant={"label"}
                        color={shouldWarnChangingtype ? "secondary" : undefined}>{propertyConfig.name}</Typography>
                </div>

                <Typography variant={"caption"}
                            color={"secondary"}
                            className={"max-w-sm"}>
                    {propertyConfig.description}
                </Typography>

            </div>
        </div>
    </Card>
}
