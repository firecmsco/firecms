import React, { useMemo, useRef } from "react";
import { EntityCollection, FieldCaption, Property, resolveCollection, useAuthController, useCustomizationController } from "@firecms/core";
import { Button, ExpandablePanel, Select, SelectItem, TextField, Typography, ViewKanbanIcon } from "@firecms/ui";
import { useFormex } from "@firecms/formex";

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

    // Resolve collection to get properties
    const resolvedCollection = useMemo(() => resolveCollection({
        collection: values,
        path: values.path,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    }), [values, customizationController.propertyConfigs, authController]);

    // Get enum string properties (for columnProperty)
    const enumStringProperties = useMemo(() => {
        const result: { key: string; label: string }[] = [];
        if (!resolvedCollection.properties) return result;

        Object.entries(resolvedCollection.properties).forEach(([key, prop]) => {
            if (prop && 'dataType' in prop && prop.dataType === 'string' && prop.enumValues) {
                result.push({
                    key,
                    label: (prop as Property).name || key
                });
            }
        });
        return result;
    }, [resolvedCollection.properties]);

    // Get number properties (for orderProperty)
    const numberProperties = useMemo(() => {
        const result: { key: string; label: string }[] = [];
        if (!resolvedCollection.properties) return result;

        Object.entries(resolvedCollection.properties).forEach(([key, prop]) => {
            if (prop && 'dataType' in prop && prop.dataType === 'number') {
                result.push({
                    key,
                    label: (prop as Property).name || key
                });
            }
        });
        return result;
    }, [resolvedCollection.properties]);

    const kanbanConfig = values.kanban;
    const hasKanbanConfig = Boolean(kanbanConfig?.columnProperty);

    // Create a new "order" number property
    const handleCreateOrderProperty = () => {
        // Defer updates to avoid React DOM reconciliation issues with Radix Select portal
        setTimeout(() => {
            const newProperties = {
                ...values.properties,
                order: {
                    dataType: "number",
                    name: "Order"
                }
            };
            const newPropertiesOrder = [...(values.propertiesOrder ?? []), "order"];

            setFieldValue("properties", newProperties);
            setFieldValue("propertiesOrder", newPropertiesOrder);
            setFieldValue("kanban", {
                ...kanbanConfig,
                orderProperty: "order"
            });
        }, 0);
    };

    // Scroll to section when forceExpanded
    React.useEffect(() => {
        if (forceExpanded && panelRef.current) {
            setTimeout(() => {
                panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
        }
    }, [forceExpanded]);

    return (
        <div className={className} ref={panelRef}>
            <ExpandablePanel
                initiallyExpanded={forceExpanded || hasKanbanConfig}
                title={
                    <div className="flex flex-row text-surface-500 text-text-secondary dark:text-text-secondary-dark">
                        <ViewKanbanIcon />
                        <Typography variant={"subtitle2"} className="ml-2">
                            Kanban Configuration
                        </Typography>
                    </div>
                }
            >
                <div className={"grid grid-cols-12 gap-4 p-4"}>
                    <div className={"col-span-12"}>
                        <Select
                            name="kanban.columnProperty"
                            label="Column Property"
                            size={"large"}
                            fullWidth={true}
                            position={"item-aligned"}
                            disabled={enumStringProperties.length === 0}
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
                                const prop = enumStringProperties.find(p => p.key === value);
                                return prop?.label || value || "Select a property";
                            }}
                        >
                            {enumStringProperties.map((prop) => (
                                <SelectItem key={prop.key} value={prop.key}>
                                    {prop.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <FieldCaption>
                            {enumStringProperties.length === 0
                                ? "No enum string properties found. Add a string property with enumValues to use Kanban view."
                                : "Select a string property with enum values to group entities into columns"
                            }
                        </FieldCaption>
                    </div>

                    <div className={"col-span-12"}>
                        <Select
                            key={`order-select-${numberProperties.length}`}
                            name="kanban.orderProperty"
                            label="Order Property"
                            size={"large"}
                            fullWidth={true}
                            position={"item-aligned"}
                            disabled={numberProperties.length === 0 || !kanbanConfig?.columnProperty}
                            value={kanbanConfig?.orderProperty ?? ""}
                            onValueChange={(v) => {
                                setFieldValue("kanban", {
                                    ...kanbanConfig,
                                    orderProperty: v || undefined
                                });
                            }}
                            renderValue={(value) => {
                                const prop = numberProperties.find(p => p.key === value);
                                return prop?.label || value || "Select a property";
                            }}
                        >
                            {numberProperties.map((prop) => (
                                <SelectItem key={prop.key} value={prop.key}>
                                    {prop.label}
                                </SelectItem>
                            ))}
                        </Select>
                        <FieldCaption>
                            {numberProperties.length === 0
                                ? "No number properties found."
                                : "Select a number property to persist the order of items within columns"
                            }
                        </FieldCaption>
                    </div>

                    {numberProperties.length === 0 && (
                        <div className={"col-span-12"}>
                            <Button size="small" variant="text" onClick={handleCreateOrderProperty}>
                                Create "order" property
                            </Button>
                        </div>
                    )}

                    <div className={"col-span-12"}>
                        <TextField
                            name="kanban.itemsPerColumn"
                            label="Items per column"
                            type="number"
                            size="large"
                            disabled={!kanbanConfig?.columnProperty}
                            value={kanbanConfig?.itemsPerColumn ?? ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFieldValue("kanban", {
                                    ...kanbanConfig,
                                    itemsPerColumn: value ? Number(value) : undefined
                                });
                            }}
                        />
                        <FieldCaption>
                            Maximum number of items to display per column (default: 50)
                        </FieldCaption>
                    </div>
                </div>
            </ExpandablePanel>
        </div>
    );
}
