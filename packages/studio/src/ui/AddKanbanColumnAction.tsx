import React, { useCallback, useMemo, useState } from "react";
import {
    getPropertyInPath,
    useAuthController,
    useCustomizationController,
    useTranslation
} from "@rebasepro/core";
import { EntityCollection, EnumValueConfig, StringProperty } from "@rebasepro/types";
import { resolveEnumValues } from "@rebasepro/common";
import {
    AddIcon,
    Button,
    cls,
    defaultBorderMixin,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    TextField,
    Typography
} from "@rebasepro/ui";
import { useCollectionsConfigController } from "../useCollectionsConfigController";
import { toSnakeCase } from "@rebasepro/utils";

/**
 * Component rendered at the end of the Kanban board to add new columns (enum values).
 * Opens a dialog to input a new enum value for the column property.
 */
export function AddKanbanColumnAction({
    collection,
    fullPath,
    parentCollectionIds,
    columnProperty
}: {
    collection: EntityCollection;
    fullPath: string;
    parentCollectionIds: string[];
    columnProperty: string;
}) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newValueLabel, setNewValueLabel] = useState("");
    const [saving, setSaving] = useState(false);

    const configController = useCollectionsConfigController();
    const authController = useAuthController();
    const customizationController = useCustomizationController();
    const { t } = useTranslation();

    // Get current enum values
    const currentEnumValues = useMemo(() => {
        const property = getPropertyInPath(collection.properties, columnProperty);
        if (!property || !('type' in property) || property.type !== "string") {
            return [];
        }
        const stringProperty = property as StringProperty;
        if (!stringProperty.enum) {
            return [];
        }
        return resolveEnumValues(stringProperty.enum) ?? [];
    }, [collection, columnProperty]);

    const handleAddColumn = useCallback(async () => {
        if (!newValueLabel.trim() || !configController) return;

        setSaving(true);
        try {
            // Check for property in persisted collection first, then resolved collection
            // This handles code-defined properties that aren't in the persisted config
            let property = collection?.properties?.[columnProperty];
            let isCodeDefinedProperty = false;

            // Property not in persisted config - use base collection
            if (!property || typeof property === 'function') {
                property = collection.properties?.[columnProperty];
                isCodeDefinedProperty = true;
            }

            // Type guard: property must be an object with type === "string"
            if (!property || typeof property === 'function' || !('type' in property) || property.type !== "string") {
                console.error("Column property not found or not a string. Property:", property);
                setSaving(false);
                return;
            }

            // Now we know property is a StringProperty
            const stringProperty = property as { type: "string"; enum?: EnumValueConfig[]; name?: string };

            // Create new enum value
            const newId = toSnakeCase(newValueLabel.trim());
            const newEnumValue = {
                id: newId,
                label: newValueLabel.trim()
            };

            // Get existing enum values from the resolved property (current runtime values)
            // Use currentEnumValues which is already computed from resolvedCollection
            const existingEnumValues = currentEnumValues.map(ev => ({
                id: ev.id,
                label: ev.label
            }));

            // Add new enum value
            const updatedEnumValues = [...existingEnumValues, newEnumValue];

            // Build the property to save
            // If it's code-defined, we create a minimal override with just enum
            const updatedProperty = isCodeDefinedProperty
                ? {
                    type: "string" as const,
                    name: stringProperty.name || columnProperty,
                    enum: updatedEnumValues
                }
                : {
                    ...property,
                    enum: updatedEnumValues
                };

            // Save the updated property
            await configController.saveProperty({
                path: fullPath,
                propertyKey: columnProperty,
                property: updatedProperty as StringProperty,
                parentCollectionIds
            });

            setNewValueLabel("");
            setDialogOpen(false);
        } catch (error) {
            console.error("Error adding new column:", error);
        } finally {
            setSaving(false);
        }
    }, [newValueLabel, configController, collection, columnProperty, fullPath, parentCollectionIds]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && newValueLabel.trim()) {
            handleAddColumn();
        }
    };

    return (
        <>
            <div
                className={cls(
                    "border h-full w-80 min-w-80 mx-2 flex flex-col items-center justify-center rounded-md",
                    "bg-surface-50 dark:bg-surface-950 hover:bg-surface-100 dark:hover:bg-surface-900",
                    "cursor-pointer transition-colors duration-200 ease-in-out",
                    defaultBorderMixin
                )}
                onClick={() => setDialogOpen(true)}
            >
                <IconButton className="opacity-60 hover:opacity-100">
                    <AddIcon />
                </IconButton>
                <Typography variant="caption" color="secondary" className="mt-2">
                    {t("studio_add_kanban_column")}
                </Typography>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-md">
                    <Typography variant="h6" className="mb-4">
                        {t("studio_add_kanban_column_title")}
                    </Typography>
                    <Typography variant="body2" color="secondary" className="mb-4">
                        {t("studio_add_kanban_column_desc", { property: columnProperty })}
                    </Typography>
                    <TextField
                        label={t("studio_add_kanban_column_name")}
                        value={newValueLabel}
                        onChange={(e) => setNewValueLabel(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        disabled={saving}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="text"
                        onClick={() => setDialogOpen(false)}
                        disabled={saving}
                    >
                        {t("studio_add_kanban_column_cancel")}
                    </Button>
                    <Button
                        onClick={handleAddColumn}
                        disabled={saving || !newValueLabel.trim()}
                    >
                        {saving ? t("studio_add_kanban_column_adding") : t("studio_add_kanban_column_add")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
