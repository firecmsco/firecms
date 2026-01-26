import React, { useMemo, useState } from "react";
import {
    EntityCollection,
    FieldCaption,
    getFieldConfig,
    Property,
    PropertyConfigBadge,
    resolveCollection,
    unslugify,
    useAuthController,
    useCustomizationController
} from "@firecms/core";
import {
    BooleanSwitchWithLabel,
    CloseIcon,
    Container,
    IconButton,
    Select,
    SelectItem,
    TextField,
    Typography
} from "@firecms/ui";

import { useFormex } from "@firecms/formex";
import { LayoutModeSwitch } from "./LayoutModeSwitch";
import { ViewModeSwitch } from "./ViewModeSwitch";
import { KanbanConfigSection } from "./KanbanConfigSection";
import { PropertyFormDialog } from "./PropertyEditView";

export function DisplaySettingsForm({
    expandKanban
}: {
    expandKanban?: boolean;
}) {

    const {
        values,
        setFieldValue,
        handleChange,
        submitCount
    } = useFormex<EntityCollection>();

    const [orderPropertyDialogOpen, setOrderPropertyDialogOpen] = useState(false);

    const authController = useAuthController();
    const customizationController = useCustomizationController();

    // Resolve collection to get properties for order property select
    const resolvedCollection = useMemo(() => resolveCollection({
        collection: values,
        path: values.path,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    }), [values, customizationController.propertyConfigs, authController]);

    // Get number properties (for orderProperty)
    const numberProperties = useMemo(() => {
        const result: { key: string; label: string; property: Property; }[] = [];
        if (!resolvedCollection.properties) return result;

        Object.entries(resolvedCollection.properties).forEach(([key, prop]) => {
            if (prop && 'dataType' in prop && prop.dataType === 'number') {
                result.push({
                    key,
                    label: (prop as Property).name || key,
                    property: prop as Property
                });
            }
        });
        return result;
    }, [resolvedCollection.properties]);

    const showErrors = submitCount > 0;

    // Document ID generation value
    let customIdValue: "true" | "false" | "optional" | "code_defined" | undefined;
    if (typeof values.customId === "object") {
        customIdValue = "code_defined";
    } else if (values.customId === true) {
        customIdValue = "true";
    } else if (values.customId === false) {
        customIdValue = "false";
    } else if (values.customId === "optional") {
        customIdValue = "optional";
    }

    return (
        <div className={"overflow-auto my-auto"}>
            <Container maxWidth={"4xl"} className={"flex flex-col gap-4 p-8 m-auto"}>

                <div>
                    <Typography variant={"h5"} className={"flex-grow"}>
                        Display settings
                    </Typography>
                </div>

                <div className={"grid grid-cols-12 gap-4"}>

                    {/* Layout Mode (Side dialog vs Full screen) */}
                    <LayoutModeSwitch
                        className={"col-span-12"}
                        value={values.sideDialogWidth !== undefined ? "side_panel" : "full_screen"}
                        onChange={(value) => {
                            if (value === "full_screen") {
                                setFieldValue("sideDialogWidth", undefined);
                            } else {
                                setFieldValue("sideDialogWidth", 768);
                            }
                        }} />

                    {/* View Mode (Table/Cards/Kanban) */}
                    <ViewModeSwitch
                        className={"col-span-12"}
                        value={values.defaultViewMode ?? "table"}
                        onChange={(value) => setFieldValue("defaultViewMode", value)} />

                    {/* Kanban Column Property */}
                    <KanbanConfigSection className={"col-span-12"} forceExpanded={expandKanban} />

                    {/* Order Property */}
                    <div className={"col-span-12 mt-4"}>
                        {(() => {
                            const orderPropertyMissing = Boolean(values.orderProperty) &&
                                !numberProperties.some(p => p.key === values.orderProperty);

                            return (
                                <>
                                    <Select
                                        key={`order-select-${numberProperties.length}`}
                                        name="orderProperty"
                                        label="Order Property"
                                        size={"large"}
                                        fullWidth={true}
                                        position={"item-aligned"}
                                        disabled={numberProperties.length === 0}
                                        error={orderPropertyMissing}
                                        value={values.orderProperty ?? ""}
                                        onValueChange={(v) => {
                                            setFieldValue("orderProperty", v || undefined);
                                        }}
                                        renderValue={(value) => {
                                            if (orderPropertyMissing) {
                                                return <span className="text-red-500">{value} (not found)</span>;
                                            }
                                            const prop = numberProperties.find(p => p.key === value);
                                            if (!prop) return "Select a property";
                                            const fieldConfig = getFieldConfig(prop.property, customizationController.propertyConfigs);
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <PropertyConfigBadge propertyConfig={fieldConfig} />
                                                    <span>{prop.label}</span>
                                                </div>
                                            );
                                        }}
                                        endAdornment={values.orderProperty ? (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFieldValue("orderProperty", undefined);
                                                }}
                                            >
                                                <CloseIcon size="small" />
                                            </IconButton>
                                        ) : undefined}
                                    >
                                        {numberProperties.map((prop) => {
                                            const fieldConfig = getFieldConfig(prop.property, customizationController.propertyConfigs);
                                            return (
                                                <SelectItem key={prop.key} value={prop.key}>
                                                    <div className="flex items-center gap-3">
                                                        <PropertyConfigBadge propertyConfig={fieldConfig} />
                                                        <div>
                                                            <div>{prop.label}</div>
                                                            <Typography variant="caption" color="secondary">
                                                                {fieldConfig?.name || "Number"}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </Select>
                                    <FieldCaption error={orderPropertyMissing}>
                                        {orderPropertyMissing
                                            ? `Property "${values.orderProperty}" does not exist or is not a number property. Please select a valid property or clear the selection.`
                                            : numberProperties.length === 0
                                                ? "No number properties found. Add a number property to enable ordering."
                                                : "Select a number property to persist the order of items"
                                        }
                                    </FieldCaption>
                                </>
                            );
                        })()}
                        {(() => {
                            const orderPropertyMissing = Boolean(values.orderProperty) &&
                                !numberProperties.some(p => p.key === values.orderProperty);
                            const showCreateButton = !values.orderProperty || orderPropertyMissing;

                            const dialogPropertyKey = orderPropertyMissing && values.orderProperty
                                ? values.orderProperty
                                : "__order";
                            const dialogPropertyName = orderPropertyMissing && values.orderProperty
                                ? unslugify(values.orderProperty)
                                : "Order";

                            if (!showCreateButton) return null;

                            return (
                                <>
                                    <button
                                        type="button"
                                        className="ml-3.5 text-sm text-primary hover:text-primary-dark mt-2"
                                        onClick={() => setOrderPropertyDialogOpen(true)}
                                    >
                                        + Create "{dialogPropertyKey}" property
                                    </button>
                                    <PropertyFormDialog
                                        open={orderPropertyDialogOpen}
                                        onCancel={() => setOrderPropertyDialogOpen(false)}
                                        property={{
                                            dataType: "number",
                                            name: dialogPropertyName,
                                            disabled: true,
                                            hideFromCollection: true
                                        }}
                                        propertyKey={dialogPropertyKey}
                                        existingProperty={false}
                                        autoOpenTypeSelect={false}
                                        autoUpdateId={false}
                                        inArray={false}
                                        allowDataInference={false}
                                        propertyConfigs={customizationController.propertyConfigs}
                                        collectionEditable={true}
                                        existingPropertyKeys={Object.keys(values.properties ?? {})}
                                        onPropertyChanged={({ id, property }) => {
                                            const newProperties = {
                                                ...values.properties,
                                                [id!]: property
                                            };
                                            const newPropertiesOrder = [...(values.propertiesOrder ?? Object.keys(values.properties ?? {})), id];
                                            setFieldValue("properties", newProperties);
                                            setFieldValue("propertiesOrder", newPropertiesOrder);
                                            setFieldValue("orderProperty", id);
                                            setOrderPropertyDialogOpen(false);
                                        }}
                                    />
                                </>
                            );
                        })()}
                    </div>

                    {/* Default row size */}
                    <div className={"col-span-12"}>
                        <Select
                            name="defaultSize"
                            size={"large"}
                            fullWidth={true}
                            label="Default row size"
                            position={"item-aligned"}
                            onChange={handleChange}
                            value={values.defaultSize ?? ""}
                            renderValue={(value: any) => value.toUpperCase()}
                        >
                            {["xs", "s", "m", "l", "xl"].map((value) => (
                                <SelectItem
                                    key={`size-select-${value}`}
                                    value={value}>
                                    {value.toUpperCase()}
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    {/* Side dialog width */}
                    <div className={"col-span-12"}>
                        <TextField
                            name={"sideDialogWidth"}
                            type={"number"}
                            aria-describedby={"sideDialogWidth-helper"}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (!value) {
                                    setFieldValue("sideDialogWidth", null);
                                } else if (!isNaN(Number(value))) {
                                    setFieldValue("sideDialogWidth", Number(value));
                                }
                            }}
                            endAdornment={<IconButton
                                size={"small"}
                                onClick={() => {
                                    setFieldValue("sideDialogWidth", null);
                                }}
                                disabled={!values.sideDialogWidth}>
                                <CloseIcon size={"small"} />
                            </IconButton>}
                            value={values.sideDialogWidth ?? ""}
                            label={"Side dialog width"} />
                        <FieldCaption>
                            Optionally define the width (in pixels) of entities side dialog. Default is 768px
                        </FieldCaption>
                    </div>

                    {/* Inline editing */}
                    <div className={"col-span-12"}>
                        <BooleanSwitchWithLabel
                            position={"start"}
                            size={"large"}
                            label={values.inlineEditing === undefined || values.inlineEditing ? "Data can be edited directly in the table view" : "Data can be edited only in the form view"}
                            onValueChange={(v) => setFieldValue("inlineEditing", v)}
                            value={values.inlineEditing === undefined ? true : values.inlineEditing}
                        />
                        <FieldCaption>
                            Allow editing data directly in the table view, without opening the form view.
                        </FieldCaption>
                    </div>

                    {/* Include JSON view */}
                    <div className={"col-span-12"}>
                        <BooleanSwitchWithLabel
                            position={"start"}
                            size={"large"}
                            label={values.includeJsonView === undefined || values.includeJsonView ? "Include JSON view" : "Do not include JSON view"}
                            onValueChange={(v) => setFieldValue("includeJsonView", v)}
                            value={values.includeJsonView === undefined ? true : values.includeJsonView}
                        />
                        <FieldCaption>
                            Include the JSON representation of the document.
                        </FieldCaption>
                    </div>

                </div>

                <div style={{ height: "52px" }} />

            </Container>
        </div>
    );
}
