import React from "react";
import { useFormex } from "@firecms/formex";
import {
    DeleteIcon,
    IconButton,
    Select,
    SelectItem,
    Typography,
    MultiSelect,
    MultiSelectItem,
    cls,
    defaultBorderMixin,
    DebouncedTextField,
    BooleanSwitchWithLabel
} from "@firecms/ui";
import {
    Properties,
    Property,
    PropertyOrBuilder,
    getFieldConfig,
    DEFAULT_FIELD_CONFIGS,
    EnumValueConfig,
    isPropertyBuilder
} from "@firecms/core";
import { PropertyWithId } from "../../PropertyEditView";
import { getPropertyPaths } from "./property_paths";

/**
 * Enum condition types - maps to PropertyConditions structure:
 * - "filter" → conditions.allowedEnumValues (JSON Logic returning allowed IDs)
 * - "exclude" → conditions.excludedEnumValues (JSON Logic returning excluded IDs)
 */
const ENUM_CONDITION_TYPES = [
    { id: "allowedEnumValues", label: "Filter Options", description: "Only show selected enum values when condition is true" },
    { id: "excludedEnumValues", label: "Exclude Options", description: "Hide selected enum values when condition is true" }
] as const;

type EnumConditionType = typeof ENUM_CONDITION_TYPES[number]["id"];

/**
 * Operators for conditions
 */
const OPERATORS = [
    { id: "==", label: "equals", valueType: "any" },
    { id: "!=", label: "not equals", valueType: "any" },
    { id: "in", label: "contains", valueType: "array" },
    { id: "!!", label: "has a value", valueType: "none" },
    { id: "!", label: "is empty", valueType: "none" }
] as const;

type OperatorId = typeof OPERATORS[number]["id"];

// Context fields
const CONTEXT_FIELDS = [
    { id: "isNew", label: "Is New Entity", dataType: "boolean", color: "#9c27b0" },
    { id: "entityId", label: "Entity ID", dataType: "string", color: "#2196f3" },
    { id: "user.roles", label: "User Roles", dataType: "array", color: "#ff9800" }
] as const;

interface EnumConditionConfig {
    field: string;
    operator: OperatorId;
    value: string;
    selectedEnumIds: string[];
}

/**
 * Get the property at a given path.
 * Returns undefined if the path contains a PropertyBuilder (callback).
 */
function getPropertyAtPath(
    fieldPath: string,
    collectionProperties?: Properties
): Property | undefined {
    if (!collectionProperties) return undefined;

    const parts = fieldPath.split(".");
    let current: Properties | undefined = collectionProperties;
    let property: Property | undefined;

    for (const part of parts) {
        if (!current) return undefined;
        const propertyOrBuilder = current[part] as PropertyOrBuilder | undefined;
        if (!propertyOrBuilder) return undefined;

        if (isPropertyBuilder(propertyOrBuilder)) return undefined;

        property = propertyOrBuilder as Property;

        if (property.dataType === "map" && property.properties) {
            current = property.properties as Properties;
        } else {
            current = undefined;
        }
    }

    return property;
}

/**
 * Get enum values from the current property being edited
 */
function getCurrentPropertyEnumValues(values: PropertyWithId): EnumValueConfig[] {
    if (values.dataType === "string" && values.enumValues) {
        if (Array.isArray(values.enumValues)) {
            return values.enumValues;
        }
        return Object.entries(values.enumValues).map(([id, label]) => ({
            id,
            label: typeof label === "string" ? label : (label as EnumValueConfig).label
        }));
    }
    return [];
}

/**
 * Get color for a field
 */
function getFieldColor(fieldPath: string, collectionProperties?: Properties): string {
    const contextField = CONTEXT_FIELDS.find(f => f.id === fieldPath);
    if (contextField) return contextField.color;

    if (!collectionProperties) return "#888";

    const prop = getPropertyAtPath(fieldPath, collectionProperties);
    if (!prop) return "#888";
    const config = getFieldConfig(prop, DEFAULT_FIELD_CONFIGS);
    return config?.color ?? "#888";
}

/**
 * Get enum values from a property (for the selected condition field)
 */
function getFieldEnumValues(property: Property | undefined): EnumValueConfig[] {
    if (!property) return [];
    if (property.dataType === "string" && property.enumValues) {
        if (Array.isArray(property.enumValues)) {
            return property.enumValues;
        }
        return Object.entries(property.enumValues).map(([id, label]) => ({
            id,
            label: typeof label === "string" ? label : (label as EnumValueConfig).label
        }));
    }
    return [];
}

/**
 * Convert an array to an object with numeric keys for Firestore storage.
 * Firestore doesn't allow nested arrays, so we store as {"0": "a", "1": "b"}
 * The runtime will convert back via objectToArray().
 */
function arrayToObject(arr: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    arr.forEach((v, i) => {
        result[String(i)] = v;
    });
    return result;
}

/**
 * Build JSON Logic rule: { "if": [ condition, thenValue, elseValue ] }
 * When condition is true, return the selected enum IDs.
 * When false, return all enum IDs or empty (depending on type).
 * 
 * IMPORTANT: We store arrays as objects with numeric keys to avoid
 * Firestore's "Nested arrays are not supported" error.
 */
function buildEnumFilterRule(
    config: EnumConditionConfig,
    conditionType: EnumConditionType,
    allEnumIds: string[]
): Record<string, unknown> {
    // Guard against empty field or operator which creates invalid Firestore keys
    if (!config.field || !config.operator) {
        // Return a valid default rule
        return {
            "if": [
                { "!!": { var: "values._placeholder" } },
                {},
                arrayToObject(allEnumIds)
            ]
        };
    }

    const fieldVar = config.field.startsWith("user.") || config.field === "isNew" || config.field === "entityId"
        ? { var: config.field }
        : { var: `values.${config.field}` };

    // Build the condition
    let condition: Record<string, unknown>;
    if (config.operator === "!!") {
        condition = { "!!": fieldVar };
    } else if (config.operator === "!") {
        condition = { "!": fieldVar };
    } else {
        let parsedValue: unknown = config.value;
        if (config.value === "true") parsedValue = true;
        else if (config.value === "false") parsedValue = false;
        else if (!isNaN(Number(config.value)) && config.value !== "") parsedValue = Number(config.value);

        if (config.operator === "in" && typeof parsedValue === "string") {
            parsedValue = parsedValue.split(",").map(s => s.trim());
        }

        condition = { [config.operator]: [fieldVar, parsedValue] };
    }

    // For allowedEnumValues: when condition true, show selected; when false, show all
    // For excludedEnumValues: when condition true, exclude selected; when false, exclude nothing
    // Convert arrays to objects to avoid Firestore nested array error
    if (conditionType === "allowedEnumValues") {
        return {
            "if": [
                condition,
                arrayToObject(config.selectedEnumIds), // When true: only these
                arrayToObject(allEnumIds)               // When false: all
            ]
        };
    } else {
        // excludedEnumValues
        return {
            "if": [
                condition,
                arrayToObject(config.selectedEnumIds), // When true: exclude these
                {}                                      // When false: exclude nothing
            ]
        };
    }
}

/**
 * Convert an object with numeric keys (Firestore serialization) back to an array.
 * {"0": "a", "1": "b"} -> ["a", "b"]
 */
function objectToArray(obj: unknown): string[] {
    if (Array.isArray(obj)) return obj.map(String);
    if (obj && typeof obj === "object") {
        const keys = Object.keys(obj);
        // Check if all keys are numeric
        if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
            return keys
                .sort((a, b) => Number(a) - Number(b))
                .map(k => String((obj as Record<string, unknown>)[k]));
        }
    }
    return [];
}

/**
 * Parse JSON Logic back to EnumConditionConfig
 */
function parseEnumFilterRule(rule: Record<string, unknown>): EnumConditionConfig | null {
    try {
        // Expected: { "if": [ condition, selectedIds, fallbackIds ] }
        const ifRule = rule["if"];
        if (!Array.isArray(ifRule) || ifRule.length < 2) return null;

        const [condition, selectedEnumIdsRaw] = ifRule;

        // Handle both array format and Firestore's object-with-numeric-keys format
        const selectedEnumIds = objectToArray(selectedEnumIdsRaw);
        if (selectedEnumIds.length === 0 && selectedEnumIdsRaw) {
            // If it was truthy but we got no values, parsing failed
            console.log("[EnumConditionsEditor] Warning: Could not parse selectedEnumIds:", selectedEnumIdsRaw);
        }

        // Parse the condition
        const conditionObj = condition as Record<string, unknown>;
        const operator = Object.keys(conditionObj)[0] as OperatorId;
        const args = conditionObj[operator] as unknown;

        let field = "";
        let value = "";

        if (operator === "!!" || operator === "!") {
            const varObj = args as Record<string, string> | null;
            if (varObj?.var) {
                field = varObj.var.replace(/^values\./, "");
            }
        } else if (Array.isArray(args) && args.length === 2) {
            const [left, right] = args as [Record<string, string>, unknown];
            if (left?.var) {
                field = left.var.replace(/^values\./, "");
                value = Array.isArray(right) ? right.join(", ") : String(right ?? "");
            }
        }

        return {
            field,
            operator,
            value,
            selectedEnumIds
        };
    } catch (e) {
        console.error("[EnumConditionsEditor] Error parsing rule:", e);
        return null;
    }
}

interface EnumConditionRowProps {
    conditionType: EnumConditionType;
    config: EnumConditionConfig;
    onConfigChange: (config: EnumConditionConfig) => void;
    onRemove: () => void;
    disabled: boolean;
    availableFields: string[];
    collectionProperties?: Properties;
    propertyEnumValues: EnumValueConfig[];
    showErrors: boolean;
}

function EnumConditionRow({
    conditionType,
    config,
    onConfigChange,
    onRemove,
    disabled,
    availableFields,
    collectionProperties,
    propertyEnumValues,
    showErrors
}: EnumConditionRowProps) {
    const operator = OPERATORS.find(op => op.id === config.operator);
    const showValueField = operator?.valueType !== "none";

    // Get the property for the selected field
    const selectedFieldProperty = getPropertyAtPath(config.field, collectionProperties);
    const isBoolean = config.field === "isNew" || selectedFieldProperty?.dataType === "boolean";

    // Check if the selected field has enum values
    const fieldEnumValues = getFieldEnumValues(selectedFieldProperty);

    // Validation: check for incomplete condition (only show after submission attempt)
    const isFieldMissing = !config.field;
    const isValueMissing = showValueField && !config.value && config.value !== "0";
    const isEnumSelectionMissing = config.selectedEnumIds.length === 0;
    const hasError = showErrors && (isFieldMissing || isValueMissing || isEnumSelectionMissing);

    return (
        <div className={cls(
            "p-3 bg-surface-50 dark:bg-surface-900 rounded-lg border",
            hasError ? "border-red-300 dark:border-red-700" : defaultBorderMixin
        )}>
            {/* Title line */}
            <div className="flex items-center justify-between mb-2">
                <Typography variant="label" className="font-medium text-primary">
                    {ENUM_CONDITION_TYPES.find(ct => ct.id === conditionType)?.label} when
                </Typography>
                <IconButton
                    onClick={onRemove}
                    disabled={disabled}
                    size="small"
                    variant="ghost">
                    <DeleteIcon size="smallest" />
                </IconButton>
            </div>

            {/* Condition row: Field, Operator, Value */}
            <div className="flex items-center gap-2 mb-3">
                {/* Field selector */}
                <Select
                    value={config.field}
                    onValueChange={(value) => onConfigChange({ ...config, field: value, value: "" })}
                    disabled={disabled}
                    size="small"
                    inputClassName="min-w-[140px]"
                    placeholder="Field">
                    {CONTEXT_FIELDS.map(field => (
                        <SelectItem key={field.id} value={field.id}>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: field.color }}
                                />
                                <span>{field.label}</span>
                            </div>
                        </SelectItem>
                    ))}
                    {availableFields.length > 0 && (
                        <SelectItem value="_divider" disabled>
                            <span className="text-xs text-surface-500">─ Fields ─</span>
                        </SelectItem>
                    )}
                    {availableFields.map(field => (
                        <SelectItem key={field} value={field}>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: getFieldColor(field, collectionProperties) }}
                                />
                                <span>{field}</span>
                            </div>
                        </SelectItem>
                    ))}
                </Select>

                {/* Operator */}
                <Select
                    value={config.operator}
                    onValueChange={(value) => onConfigChange({ ...config, operator: value as OperatorId })}
                    disabled={disabled}
                    size="small"
                    inputClassName="min-w-[100px]">
                    {OPERATORS.map(op => (
                        <SelectItem key={op.id} value={op.id}>{op.label}</SelectItem>
                    ))}
                </Select>

                {/* Value - dynamic based on field type */}
                {showValueField && (
                    isBoolean ? (
                        <BooleanSwitchWithLabel
                            value={config.value === "true"}
                            size="small"
                            position="start"
                            disabled={disabled}
                            onValueChange={(v) => onConfigChange({ ...config, value: v ? "true" : "false" })}
                        />
                    ) : fieldEnumValues.length > 0 ? (
                        // Show Select for enum fields
                        <Select
                            value={config.value}
                            onValueChange={(value) => onConfigChange({ ...config, value })}
                            disabled={disabled}
                            size="small"
                            placeholder="Select value..."
                            className="min-w-[120px]">
                            {fieldEnumValues.map(ev => (
                                <SelectItem key={String(ev.id)} value={String(ev.id)}>
                                    {ev.label}
                                </SelectItem>
                            ))}
                        </Select>
                    ) : (
                        <DebouncedTextField
                            value={config.value}
                            onChange={(e) => onConfigChange({ ...config, value: e.target.value })}
                            disabled={disabled}
                            size="small"
                            placeholder="Value"
                            className="flex-1 min-w-[80px]"
                        />
                    )
                )}
            </div>

            {/* Enum selection */}
            <div>
                <Typography variant="caption" color="secondary" className="block mb-2">
                    {conditionType === "allowedEnumValues" ? "Show only:" : "Hide:"}
                </Typography>
                <MultiSelect
                    value={config.selectedEnumIds}
                    onValueChange={(values) => onConfigChange({ ...config, selectedEnumIds: values })}
                    disabled={disabled}
                    size="small"
                    placeholder="Select values..."
                    useChips={true}>
                    {propertyEnumValues.map(ev => (
                        <MultiSelectItem key={String(ev.id)} value={String(ev.id)}>
                            {ev.label}
                        </MultiSelectItem>
                    ))}
                </MultiSelect>
            </div>

            {/* Validation error message */}
            {hasError && (
                <Typography variant="caption" className="mt-2 text-red-500 dark:text-red-400">
                    {isFieldMissing
                        ? "Please select a field for this condition"
                        : isValueMissing
                            ? "Please enter a value for this condition"
                            : "Please select at least one value to filter"
                    }
                </Typography>
            )}
        </div>
    );
}

export interface EnumConditionsEditorProps {
    disabled: boolean;
    collectionProperties?: Properties;
}

export function EnumConditionsEditor({ disabled, collectionProperties }: EnumConditionsEditorProps) {
    const { values, setFieldValue, submitCount } = useFormex<PropertyWithId>();

    const availableFields: string[] = collectionProperties
        ? getPropertyPaths(collectionProperties)
        : [];

    const propertyEnumValues = getCurrentPropertyEnumValues(values);

    // Only show for enum properties
    if (propertyEnumValues.length === 0) {
        return null;
    }

    const allEnumIds = propertyEnumValues.map(ev => String(ev.id));

    // Get conditions from the correct path: values.conditions
    const conditions = (values as PropertyWithId & { conditions?: Record<string, unknown> }).conditions ?? {};

    // Parse existing enum conditions
    const activeConditions: { type: EnumConditionType; config: EnumConditionConfig }[] = [];

    for (const type of ENUM_CONDITION_TYPES) {
        const rule = conditions[type.id] as Record<string, unknown> | undefined;
        if (rule) {
            const config = parseEnumFilterRule(rule);
            if (config) {
                activeConditions.push({ type: type.id, config });
            }
        }
    }

    const handleAddCondition = (conditionType: EnumConditionType) => {
        const defaultConfig: EnumConditionConfig = {
            field: availableFields[0] ?? "isNew",
            operator: "==",
            value: "",
            selectedEnumIds: []
        };

        const rule = buildEnumFilterRule(defaultConfig, conditionType, allEnumIds);
        setFieldValue(`conditions.${conditionType}`, rule);
    };

    const handleConfigChange = (type: EnumConditionType, config: EnumConditionConfig) => {
        const rule = buildEnumFilterRule(config, type, allEnumIds);
        setFieldValue(`conditions.${type}`, rule);
    };

    const handleRemoveCondition = (type: EnumConditionType) => {
        const newConditions = { ...conditions };
        delete newConditions[type];
        if (Object.keys(newConditions).length === 0) {
            setFieldValue("conditions", undefined);
        } else {
            setFieldValue("conditions", newConditions);
        }
    };

    const availableConditionTypes = ENUM_CONDITION_TYPES.filter(
        ct => !conditions[ct.id]
    );

    return (
        <div className={cls("flex flex-col gap-4 mt-4 pt-4 border-t", defaultBorderMixin)}>
            <Typography variant="label" className="font-medium">
                Enum Value Conditions
            </Typography>
            <Typography variant="caption" color="secondary">
                Dynamically filter which options are available.
            </Typography>

            {activeConditions.length > 0 && (
                <div className="flex flex-col gap-3">
                    {activeConditions.map(({ type, config }) => (
                        <EnumConditionRow
                            key={type}
                            conditionType={type}
                            config={config}
                            onConfigChange={(newConfig) => handleConfigChange(type, newConfig)}
                            onRemove={() => handleRemoveCondition(type)}
                            disabled={disabled}
                            availableFields={availableFields}
                            collectionProperties={collectionProperties}
                            propertyEnumValues={propertyEnumValues}
                            showErrors={submitCount > 0}
                        />
                    ))}
                </div>
            )}

            {availableConditionTypes.length > 0 && (
                <Select
                    value=""
                    onValueChange={(value) => handleAddCondition(value as EnumConditionType)}
                    disabled={disabled}
                    size="small"
                    placeholder="+ Add enum condition..."
                    className="w-full max-w-xs">
                    {availableConditionTypes.map(ct => (
                        <SelectItem key={ct.id} value={ct.id}>
                            <div className="flex flex-col">
                                <span className="font-medium">{ct.label}</span>
                                <span className="text-xs text-surface-500">{ct.description}</span>
                            </div>
                        </SelectItem>
                    ))}
                </Select>
            )}
        </div>
    );
}
