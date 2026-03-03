import React, { useMemo, useRef, useState } from "react";
import {
    EntityCollection,
    FieldCaption,
    getFieldConfig,
    Property,
    PropertyConfigBadge,
    unslugify,
    useAuthController,
    useCustomizationController
} from "@firecms/core";
import {
    CloseIcon,
    IconButton,
    Select,
    SelectItem,
    Typography
} from "@firecms/ui";
import { useFormex } from "@firecms/formex";
import { PropertyFormDialog } from "./PropertyEditView";

export function KanbanConfigSection({
    className,
    forceExpanded
}: {
    className?: string;
    forceExpanded?: boolean;
}) {
    const authController = useAuthController();
    const customizationController = useCustomizationController();
    const { values, setFieldValue } = useFormex<EntityCollection>();
    const panelRef = useRef<HTMLDivElement>(null);
    const [columnPropertyDialogOpen, setColumnPropertyDialogOpen] = useState(false);

    // Get enum string properties (for columnProperty)
    const enumStringProperties = useMemo(() => {
        const result: { key: string; label: string; property: Property }[] = [];
        if (!values.properties) return result;

        Object.entries(values.properties).forEach(([key, prop]) => {
            if (prop && 'type' in prop && prop.type === 'string' && prop.enum) {
                result.push({
                    key,
                    label: (prop as Property).name || key,
                    property: prop as Property
                });
            }
        });
        return result;
    }, [values.properties]);

    const kanbanConfig = values.kanban;

    // Check if columnProperty references a non-existent property
    const columnPropertyMissing = Boolean(kanbanConfig?.columnProperty) &&
        !enumStringProperties.some(p => p.key === kanbanConfig?.columnProperty);

    // Scroll to section when forceExpanded
    React.useEffect(() => {
        if (forceExpanded && panelRef.current) {
            setTimeout(() => {
                panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
        }
    }, [forceExpanded]);

    const showCreateButton = !kanbanConfig?.columnProperty || columnPropertyMissing;
    const dialogPropertyKey = columnPropertyMissing && kanbanConfig?.columnProperty
        ? kanbanConfig.columnProperty
        : "status";
    const dialogPropertyName = columnPropertyMissing && kanbanConfig?.columnProperty
        ? unslugify(kanbanConfig.columnProperty)
        : "Status";

    return (
        <div className={className} ref={panelRef}>
            <Select
                key={`column-select-${enumStringProperties.length}`}
                name="kanban.columnProperty"
                label="Kanban Column Property"
                size={"large"}
                fullWidth={true}
                position={"item-aligned"}
                disabled={enumStringProperties.length === 0}
                error={columnPropertyMissing}
                value={kanbanConfig?.columnProperty ?? ""}
                onValueChange={(v) => {
                    if (v) {
                        setFieldValue("kanban", {
                            ...kanbanConfig,
                            columnProperty: v
                        });
                    } else {
                        setFieldValue("kanban", undefined);
                    }
                }}
                renderValue={(value) => {
                    if (columnPropertyMissing) {
                        return <span className="text-red-500">{value} (not found)</span>;
                    }
                    const prop = enumStringProperties.find(p => p.key === value);
                    if (!prop) return "Select a property";
                    const fieldConfig = getFieldConfig(prop.property, customizationController.propertyConfigs);
                    return (
                        <div className="flex items-center gap-2">
                            <PropertyConfigBadge propertyConfig={fieldConfig} />
                            <span>{prop.label}</span>
                        </div>
                    );
                }}
                endAdornment={kanbanConfig?.columnProperty ? (
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFieldValue("kanban", undefined);
                        }}
                    >
                        <CloseIcon size="small" />
                    </IconButton>
                ) : undefined}
            >
                {enumStringProperties.map((prop) => {
                    const fieldConfig = getFieldConfig(prop.property, customizationController.propertyConfigs);
                    return (
                        <SelectItem key={prop.key} value={prop.key}>
                            <div className="flex items-center gap-3">
                                <PropertyConfigBadge propertyConfig={fieldConfig} />
                                <div>
                                    <div>{prop.label}</div>
                                    <Typography variant="caption" color="secondary">
                                        {fieldConfig?.name || "Enum"}
                                    </Typography>
                                </div>
                            </div>
                        </SelectItem>
                    );
                })}
            </Select>
            <FieldCaption error={columnPropertyMissing}>
                {columnPropertyMissing
                    ? `Property "${kanbanConfig?.columnProperty}" does not exist or is not an enum string property. Please select a valid property or clear the selection.`
                    : enumStringProperties.length === 0
                        ? "No enum string properties found. Add a string property with enum to use Kanban view."
                        : "Select a string property with enum values to group entities into columns"
                }
            </FieldCaption>

            {showCreateButton && (
                <>
                    <button
                        type="button"
                        className="ml-3.5 text-sm text-primary hover:text-primary-dark mt-2"
                        onClick={() => setColumnPropertyDialogOpen(true)}
                    >
                        + Create "{dialogPropertyKey}" property
                    </button>
                    <PropertyFormDialog
                        open={columnPropertyDialogOpen}
                        onCancel={() => setColumnPropertyDialogOpen(false)}
                        property={{
                            type: "string",
                            name: dialogPropertyName,
                            enum: [
                                { id: "todo", label: "To Do" },
                                { id: "in_progress", label: "In Progress" },
                                { id: "done", label: "Done" }
                            ]
                        } as any}
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
                            setFieldValue("kanban", {
                                ...kanbanConfig,
                                columnProperty: id
                            });
                            setColumnPropertyDialogOpen(false);
                        }}
                    />
                </>
            )}
        </div>
    );
}
