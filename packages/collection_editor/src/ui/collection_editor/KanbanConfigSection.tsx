import React, { useMemo, useRef, useState } from "react";
import {
    EntityCollection,
    FieldCaption,
    getFieldConfig,
    Property,
    PropertyConfigBadge,
    resolveCollection,
    unslugify,
    useAuthController,
    useCustomizationController,
    useTranslation
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
    const { t } = useTranslation();
    const panelRef = useRef<HTMLDivElement>(null);
    const [columnPropertyDialogOpen, setColumnPropertyDialogOpen] = useState(false);

    // Resolve collection to get properties
    const resolvedCollection = useMemo(() => resolveCollection({
        collection: values,
        path: values.path,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    }), [values, customizationController.propertyConfigs, authController]);

    // Get enum string properties (for columnProperty)
    const enumStringProperties = useMemo(() => {
        const result: { key: string; label: string; property: Property }[] = [];
        if (!resolvedCollection.properties) return result;

        Object.entries(resolvedCollection.properties).forEach(([key, prop]) => {
            if (prop && 'dataType' in prop && prop.dataType === 'string' && prop.enumValues) {
                result.push({
                    key,
                    label: (prop as Property).name || key,
                    property: prop as Property
                });
            }
        });
        return result;
    }, [resolvedCollection.properties]);

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
                label={t("kanban_column_property")}
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
                        return <span className="text-red-500">{value} ({t("not_found_suffix")})</span>;
                    }
                    const prop = enumStringProperties.find(p => p.key === value);
                    if (!prop) return t("select_a_property");
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
                                        {fieldConfig?.name || "enum"}
                                    </Typography>
                                </div>
                            </div>
                        </SelectItem>
                    );
                })}
            </Select>
            <FieldCaption error={columnPropertyMissing}>
                {columnPropertyMissing
                    ? t("kanban_property_not_found", { property: kanbanConfig?.columnProperty ?? "" })
                    : enumStringProperties.length === 0
                        ? t("no_enum_string_properties")
                        : t("kanban_column_description")
                }
            </FieldCaption>

            {showCreateButton && (
                <>
                    <button
                        type="button"
                        className="ml-3.5 text-sm text-primary hover:text-primary-dark mt-2"
                        onClick={() => setColumnPropertyDialogOpen(true)}
                    >
                        {t("create_property", { property: dialogPropertyKey })}
                    </button>
                    <PropertyFormDialog
                        open={columnPropertyDialogOpen}
                        onCancel={() => setColumnPropertyDialogOpen(false)}
                        property={{
                            dataType: "string",
                            name: dialogPropertyName,
                            enumValues: [
                                { id: "todo", label: "To Do" },
                                { id: "in_progress", label: "In Progress" },
                                { id: "done", label: "Done" }
                            ]
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
