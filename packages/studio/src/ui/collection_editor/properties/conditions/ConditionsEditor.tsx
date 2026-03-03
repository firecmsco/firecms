import React from "react";
import { useFormex } from "@firecms/formex";
import {
    DeleteIcon,
    IconButton,
    Select,
    SelectItem,
    DebouncedTextField,
    Typography,
    Chip,
    BooleanSwitchWithLabel,
    TextField,
    cls,
    defaultBorderMixin
} from "@firecms/ui";
import {
    Properties,
    Property,
    getFieldConfig,
    DEFAULT_FIELD_CONFIGS,
    EnumValueConfig
} from "@firecms/core";
import { isPropertyBuilder } from "@firecms/common";
import { PropertyWithId } from "../../PropertyEditView";
import { getPropertyPaths } from "./property_paths";

/**
 * Condition types that can be configured
 */
const CONDITION_TYPES = [
    { id: "disabled", label: "Disabled", description: "Disable this field when condition is true" },
    { id: "hidden", label: "Hidden", description: "Hide this field when condition is true" },
    { id: "required", label: "Required", description: "Make this field required when condition is true" },
    { id: "readOnly", label: "Read Only", description: "Make this field read-only when condition is true" }
] as const;

type ConditionType = typeof CONDITION_TYPES[number]["id"];

/**
 * Operators for building conditions with their applicable data types
 */
const OPERATORS = [
    { id: "==", label: "equals", valueType: "any", applicableTo: ["string", "number", "boolean", "date"] },
    { id: "!=", label: "not equals", valueType: "any", applicableTo: ["string", "number", "boolean", "date"] },
    { id: ">", label: "greater than", valueType: "number", applicableTo: ["number", "date"] },
    { id: "<", label: "less than", valueType: "number", applicableTo: ["number", "date"] },
    { id: ">=", label: "greater or equal", valueType: "number", applicableTo: ["number", "date"] },
    { id: "<=", label: "less or equal", valueType: "number", applicableTo: ["number", "date"] },
    { id: "in", label: "contains", valueType: "any", applicableTo: ["array"] },
    { id: "!in", label: "not contains", valueType: "any", applicableTo: ["array"] },
    { id: "!!", label: "has a value", valueType: "none", applicableTo: ["string", "number", "boolean", "array", "map", "date"] },
    { id: "!", label: "is empty", valueType: "none", applicableTo: ["string", "number", "boolean", "array", "map", "date"] },
    { id: "isPast", label: "is in the past", valueType: "none", applicableTo: ["date"] },
    { id: "isFuture", label: "is in the future", valueType: "none", applicableTo: ["date"] }
] as const;

type OperatorId = typeof OPERATORS[number]["id"];

// Context fields with their types
const CONTEXT_FIELDS = [
    { id: "isNew", label: "Is New Entity", dataType: "boolean", color: "#9c27b0" },
    { id: "entityId", label: "Entity ID", dataType: "string", color: "#2196f3" },
    { id: "user.roles", label: "User Roles", dataType: "array", color: "#ff9800" }
] as const;

interface SimpleRule {
    field: string;
    operator: OperatorId;
    value: string;
}

type LogicOperator = "and" | "or";

/**
 * A condition group can contain rules and/or nested groups
 */
interface ConditionGroup {
    logic: LogicOperator;
    rules: SimpleRule[];
    groups?: ConditionGroup[];  // Nested groups for complex logic
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
        const propertyOrBuilder = current[part] as Property | undefined;
        if (!propertyOrBuilder) return undefined;

        // Skip PropertyBuilder functions - they require runtime values
        if (isPropertyBuilder(propertyOrBuilder)) return undefined;

        property = propertyOrBuilder as Property;

        if (property.type === "map" && property.properties) {
            current = property.properties as Properties;
        } else {
            current = undefined;
        }
    }

    return property;
}

/**
 * Get the data type for a field path
 */
function getFieldDataType(
    fieldPath: string,
    collectionProperties?: Properties
): string {
    // Check context fields first
    const contextField = CONTEXT_FIELDS.find(f => f.id === fieldPath);
    if (contextField) return contextField.dataType;

    const property = getPropertyAtPath(fieldPath, collectionProperties);
    return property?.type ?? "string";
}

/**
 * Get enum values for a property if it has them
 */
function getEnumValues(property: Property | undefined): EnumValueConfig[] | undefined {
    if (!property) return undefined;
    if (property.type === "string" && property.enum) {
        // Normalize to array format
        if (Array.isArray(property.enum)) {
            return property.enum;
        }
        // Handle object format { key: label }
        return Object.entries(property.enum).map(([id, label]) => ({
            id,
            label: typeof label === "string" ? label : (label as EnumValueConfig).label
        }));
    }
    return undefined;
}

/**
 * Get operators applicable for a given data type
 */
function getOperatorsForDataType(dataType: string) {
    return OPERATORS.filter(op => {
        const applicable = op.applicableTo as readonly string[];
        return applicable.includes(dataType) ||
            (applicable.includes("string") && !["number", "date", "array"].includes(dataType));
    });
}

/**
 * Props for a single rule row (used inside a group)
 */
interface RuleRowProps {
    rule: SimpleRule;
    onRuleChange: (rule: SimpleRule) => void;
    onRemove: () => void;
    disabled: boolean;
    availableFields: string[];
    collectionProperties?: Properties;
    showErrors: boolean;
    showRemoveButton: boolean;
}

/**
 * Props for a condition group (with AND/OR logic)
 */
interface ConditionGroupRowProps {
    conditionType: ConditionType;
    group: ConditionGroup;
    onGroupChange: (group: ConditionGroup) => void;
    onRemove: () => void;
    disabled: boolean;
    availableFields: string[];
    collectionProperties?: Properties;
    showErrors: boolean;
}

/**
 * Dynamic value input based on field data type and enum values
 */
function ConditionValueInput({
    value,
    onChange,
    dataType,
    enumValues,
    disabled,
    operator
}: {
    value: string;
    onChange: (value: string) => void;
    dataType: string;
    enumValues?: EnumValueConfig[];
    disabled: boolean;
    operator: OperatorId;
}) {
    // For truthy/falsy operators, no value needed
    if (operator === "!!" || operator === "!") {
        return null;
    }

    // Boolean - use switch
    if (dataType === "boolean") {
        return (
            <BooleanSwitchWithLabel
                value={value === "true"}
                size="small"
                position="start"
                disabled={disabled}
                onValueChange={(newValue) => onChange(newValue ? "true" : "false")}
            />
        );
    }

    // Enum/string with enumValues - use select
    if (enumValues && enumValues.length > 0) {
        return (
            <Select
                value={value}
                onValueChange={onChange}
                disabled={disabled}
                size="small"
                className="min-w-[120px]"
                placeholder="Select value">
                {enumValues.map(ev => (
                    <SelectItem key={ev.id} value={String(ev.id)}>
                        {ev.label}
                    </SelectItem>
                ))}
            </Select>
        );
    }

    // Number - use number input
    if (dataType === "number") {
        return (
            <TextField
                value={value}
                type="number"
                size="small"
                disabled={disabled}
                placeholder="Value"
                className="flex-1 min-w-[80px]"
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    // Array - comma separated values
    if (dataType === "array") {
        return (
            <DebouncedTextField
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                size="small"
                placeholder="value1, value2"
                className="flex-1 min-w-[120px]"
            />
        );
    }

    // Default - text input
    return (
        <DebouncedTextField
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            size="small"
            placeholder="Value"
            className="flex-1 min-w-[100px]"
            inputClassName="min-w-[100px]"
        />
    );
}

function ConditionRow({
    rule,
    onRuleChange,
    onRemove,
    disabled,
    availableFields,
    collectionProperties,
    showErrors,
    showRemoveButton = true
}: RuleRowProps & { showRemoveButton?: boolean }) {
    const fieldDataType = getFieldDataType(rule.field, collectionProperties);
    const applicableOperators = getOperatorsForDataType(fieldDataType);
    const property = getPropertyAtPath(rule.field, collectionProperties);
    const enumValues = getEnumValues(property);
    const operator = OPERATORS.find(op => op.id === rule.operator);
    const showValueField = operator?.valueType !== "none";

    // Validation: check for incomplete condition (only show after submission attempt)
    const isFieldMissing = !rule.field;
    const isValueMissing = showValueField && !rule.value && rule.value !== "0";
    const hasError = showErrors && (isFieldMissing || isValueMissing);

    // Get color for the field
    const getFieldColor = (fieldPath: string): string => {
        const contextField = CONTEXT_FIELDS.find(f => f.id === fieldPath);
        if (contextField) return contextField.color;

        if (!collectionProperties) return "#888";

        const prop = getPropertyAtPath(fieldPath, collectionProperties);
        if (!prop) return "#888";
        const config = getFieldConfig(prop, DEFAULT_FIELD_CONFIGS);
        return config?.color ?? "#888";
    };

    return (
        <div className={cls(
            "flex items-center gap-2 p-2 rounded-md",
            hasError ? "bg-red-50 dark:bg-red-900/20" : "bg-surface-100 dark:bg-surface-800"
        )}>
            {/* Field selector with colored badge */}
            <Select
                value={rule.field}
                onValueChange={(value) => {
                    const newDataType = getFieldDataType(value, collectionProperties);
                    const newApplicableOps = getOperatorsForDataType(newDataType);
                    // Reset operator if current one isn't applicable
                    const newOperator = newApplicableOps.find(op => op.id === rule.operator)
                        ? rule.operator
                        : newApplicableOps[0]?.id ?? "==";
                    // Reset value when changing field
                    onRuleChange({ ...rule, field: value, operator: newOperator as OperatorId, value: "" });
                }}
                disabled={disabled}
                size="small"
                inputClassName="min-w-[180px]"
                renderValue={(value) => (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: getFieldColor(value) }}
                        />
                        <span className="truncate">{value}</span>
                    </div>
                )}
                placeholder="Select field">
                {/* Context fields */}
                {CONTEXT_FIELDS.map(field => (
                    <SelectItem key={field.id} value={field.id}>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: field.color }}
                            />
                            <span>{field.label}</span>
                            <Chip size="small" colorScheme="grayLight" className="ml-auto">
                                {field.dataType}
                            </Chip>
                        </div>
                    </SelectItem>
                ))}

                {/* Separator */}
                {availableFields.length > 0 && (
                    <SelectItem value="_divider" disabled>
                        <span className="text-xs text-surface-500">─ Entity Fields ─</span>
                    </SelectItem>
                )}

                {/* Property fields */}
                {availableFields.map(field => {
                    const color = getFieldColor(field);
                    const dataType = getFieldDataType(field, collectionProperties);
                    const prop = getPropertyAtPath(field, collectionProperties);
                    const hasEnum = !!getEnumValues(prop);
                    return (
                        <SelectItem key={field} value={field}>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: color }}
                                />
                                <span>{field}</span>
                                <Chip size="small" colorScheme="grayLight" className="ml-auto">
                                    {hasEnum ? "enum" : dataType}
                                </Chip>
                            </div>
                        </SelectItem>
                    );
                })}
            </Select>

            {/* Operator - filtered by field type */}
            <Select
                value={rule.operator}
                onValueChange={(value) => onRuleChange({ ...rule, operator: value as OperatorId })}
                disabled={disabled}
                size="small"
                inputClassName="min-w-[120px]">
                {applicableOperators.map(op => (
                    <SelectItem key={op.id} value={op.id}>
                        {op.label}
                    </SelectItem>
                ))}
            </Select>

            {/* Dynamic Value input */}
            {showValueField && (
                <ConditionValueInput
                    value={rule.value}
                    onChange={(newValue) => onRuleChange({ ...rule, value: newValue })}
                    dataType={fieldDataType}
                    enumValues={enumValues}
                    disabled={disabled}
                    operator={rule.operator}
                />
            )}

            {/* Remove button */}
            {showRemoveButton && (
                <IconButton onClick={onRemove} disabled={disabled} size="small" variant="ghost">
                    <DeleteIcon size="smallest" />
                </IconButton>
            )}
        </div>
    );
}

/**
 * A condition group row with AND/OR logic selector and multiple rules
 */
function ConditionGroupRow({
    conditionType,
    group,
    onGroupChange,
    onRemove,
    disabled,
    availableFields,
    collectionProperties,
    showErrors
}: ConditionGroupRowProps) {
    const handleLogicChange = (logic: LogicOperator) => {
        onGroupChange({ ...group, logic });
    };

    const handleRuleChange = (index: number, rule: SimpleRule) => {
        const newRules = [...group.rules];
        newRules[index] = rule;
        onGroupChange({ ...group, rules: newRules });
    };

    const handleRemoveRule = (index: number) => {
        const newRules = group.rules.filter((_, i) => i !== index);
        if (newRules.length === 0) {
            onRemove();
        } else {
            onGroupChange({ ...group, rules: newRules });
        }
    };

    const handleAddRule = () => {
        const defaultRule: SimpleRule = {
            field: availableFields[0] ?? "isNew",
            operator: "==",
            value: ""
        };
        onGroupChange({ ...group, rules: [...group.rules, defaultRule] });
    };

    return (
        <div className={cls("p-3 bg-surface-50 dark:bg-surface-900 rounded-lg border", defaultBorderMixin)}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Typography variant="label" className="font-medium text-primary">
                        {CONDITION_TYPES.find(ct => ct.id === conditionType)?.label} when
                    </Typography>
                    {group.rules.length > 1 && (
                        <Select
                            value={group.logic}
                            onValueChange={(value) => handleLogicChange(value as LogicOperator)}
                            disabled={disabled}
                            size="small"
                            inputClassName="min-w-[100px]">
                            <SelectItem value="and">All of these</SelectItem>
                            <SelectItem value="or">Any of these</SelectItem>
                        </Select>
                    )}
                </div>
                <IconButton onClick={onRemove} disabled={disabled} size="small" variant="ghost">
                    <DeleteIcon size="smallest" />
                </IconButton>
            </div>

            <div className="flex flex-col gap-2">
                {group.rules.map((rule, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <Typography variant="caption" className="text-center text-secondary font-medium uppercase">
                                {group.logic === "and" ? "AND" : "OR"}
                            </Typography>
                        )}
                        <ConditionRow
                            rule={rule}
                            onRuleChange={(newRule: SimpleRule) => handleRuleChange(index, newRule)}
                            onRemove={() => handleRemoveRule(index)}
                            disabled={disabled}
                            availableFields={availableFields}
                            collectionProperties={collectionProperties}
                            showErrors={showErrors}
                            showRemoveButton={group.rules.length > 1}
                        />
                    </React.Fragment>
                ))}
            </div>

            <button
                onClick={handleAddRule}
                disabled={disabled}
                type="button"
                className={cls(
                    "mt-3 w-full py-2 px-3 rounded-md text-sm",
                    "border border-dashed text-secondary",
                    "hover:bg-surface-100 dark:hover:bg-surface-800",
                    "transition-colors",
                    defaultBorderMixin
                )}
            >
                + Add condition
            </button>
        </div>
    );
}

/**
 * Convert a simple rule to JSON-Logic format
 */
function simpleRuleToJsonLogic(rule: SimpleRule): Record<string, any> {
    // Guard against empty field or operator which creates invalid Firestore keys
    if (!rule.field || !rule.operator) {
        // Return a valid default rule instead of creating invalid data
        return { "!!": { var: "values._placeholder" } };
    }

    const varRef = { var: `values.${rule.field}` };

    // Handle special fields that don't need the "values." prefix
    const fieldVar = rule.field.startsWith("user.") || rule.field === "isNew" || rule.field === "entityId"
        ? { var: rule.field }
        : varRef;

    if (rule.operator === "!!") {
        return { "!!": fieldVar };
    }
    if (rule.operator === "!") {
        return { "!": fieldVar };
    }
    if (rule.operator === "isPast") {
        return { "isPast": fieldVar };
    }
    if (rule.operator === "isFuture") {
        return { "isFuture": fieldVar };
    }

    // Parse value - try to convert to appropriate type
    let parsedValue: any = rule.value;
    if (rule.value === "true") parsedValue = true;
    else if (rule.value === "false") parsedValue = false;
    else if (rule.value === "null") parsedValue = null;
    else if (!isNaN(Number(rule.value)) && rule.value !== "") parsedValue = Number(rule.value);

    // Handle array values for "in" and "!in" operators
    if ((rule.operator === "in" || rule.operator === "!in") && typeof parsedValue === "string") {
        parsedValue = parsedValue.split(",").map(s => s.trim());
    }

    // Handle "!in" (not contains) - wrap "in" with negation
    if (rule.operator === "!in") {
        return { "!": { "in": [fieldVar, parsedValue] } };
    }

    return { [rule.operator]: [fieldVar, parsedValue] };
}

/**
 * Try to parse JSON-Logic back to a simple rule
 */
function jsonLogicToSimpleRule(jsonLogic: Record<string, any>): SimpleRule | null {
    try {
        const operator = Object.keys(jsonLogic)[0] as OperatorId;
        const args = jsonLogic[operator];

        // Handle "!" operator - could be negation of a value or negation of "in" (not contains)
        if (operator === "!") {
            // Check if it's a negated "in" operation: {"!": {"in": [...]}}
            if (typeof args === "object" && args !== null && "in" in args) {
                const inArgs = args.in;
                if (Array.isArray(inArgs) && inArgs.length === 2) {
                    const [left, right] = inArgs;
                    if (left?.var) {
                        const field = left.var.replace(/^values\./, "");
                        const value = Array.isArray(right)
                            ? right.join(", ")
                            : String(right ?? "");
                        return { field, operator: "!in", value };
                    }
                }
            }
            // Otherwise it's a simple negation (is falsy)
            if (args?.var) {
                const field = args.var.replace(/^values\./, "");
                return { field, operator: "!", value: "" };
            }
        }

        if (operator === "!!") {
            const varObj = args;
            if (varObj?.var) {
                const field = varObj.var.replace(/^values\./, "");
                return { field, operator, value: "" };
            }
        }

        // Handle isPast and isFuture operators
        if (operator === "isPast" || operator === "isFuture") {
            const varObj = args;
            if (varObj?.var) {
                const field = varObj.var.replace(/^values\./, "");
                return { field, operator, value: "" };
            }
        }

        if (Array.isArray(args) && args.length === 2) {
            const [left, right] = args;
            if (left?.var) {
                const field = left.var.replace(/^values\./, "");
                const value = Array.isArray(right)
                    ? right.join(", ")
                    : String(right ?? "");
                return { field, operator, value };
            }
        }
    } catch {
        // Fall through
    }
    return null;
}

/**
 * Convert a condition group to JSON-Logic format
 */
function groupToJsonLogic(group: ConditionGroup): Record<string, any> {
    const ruleLogics = group.rules
        .filter(rule => rule.field && rule.operator) // Filter out incomplete rules
        .map(rule => simpleRuleToJsonLogic(rule));

    const groupLogics = (group.groups || [])
        .map(g => groupToJsonLogic(g));

    const allLogics = [...ruleLogics, ...groupLogics];

    // If only one condition, don't wrap in and/or
    if (allLogics.length === 1) {
        return allLogics[0];
    }

    // If no conditions, return a default true condition
    if (allLogics.length === 0) {
        return { "!!": { var: "values._placeholder" } };
    }

    return { [group.logic]: allLogics };
}

/**
 * Try to parse JSON-Logic back to a condition group
 */
function jsonLogicToGroup(jsonLogic: Record<string, any>): ConditionGroup | null {
    try {
        const operator = Object.keys(jsonLogic)[0];

        // Check if it's an AND or OR group
        if (operator === "and" || operator === "or") {
            const args = jsonLogic[operator];
            if (Array.isArray(args)) {
                const rules: SimpleRule[] = [];
                const groups: ConditionGroup[] = [];

                for (const arg of args) {
                    // Check if this is a nested group
                    const nestedOperator = Object.keys(arg)[0];
                    if (nestedOperator === "and" || nestedOperator === "or") {
                        const nestedGroup = jsonLogicToGroup(arg);
                        if (nestedGroup) {
                            groups.push(nestedGroup);
                        }
                    } else {
                        // It's a simple rule
                        const rule = jsonLogicToSimpleRule(arg);
                        if (rule) {
                            rules.push(rule);
                        }
                    }
                }

                return {
                    logic: operator,
                    rules,
                    groups: groups.length > 0 ? groups : undefined
                };
            }
        }

        // It's a single rule - wrap in an AND group
        const rule = jsonLogicToSimpleRule(jsonLogic);
        if (rule) {
            return {
                logic: "and",
                rules: [rule]
            };
        }
    } catch {
        // Fall through
    }
    return null;
}

export interface ConditionsEditorProps {
    disabled: boolean;
    /**
     * Optional collection properties for populating the field selector.
     * If not provided, a basic set of common fields is used.
     */
    collectionProperties?: Properties;
}

export function ConditionsEditor({ disabled, collectionProperties }: ConditionsEditorProps) {
    const { values, setFieldValue, submitCount } = useFormex<PropertyWithId>();

    // Get property paths from collection properties (includes nested maps)
    const availableFields: string[] = collectionProperties
        ? getPropertyPaths(collectionProperties)
        : [];

    // Get current conditions from form values
    const conditions = (values as any).conditions ?? {};

    // DEBUG: Log conditions to see what's being loaded
    console.log("[ConditionsEditor] Loaded conditions:", conditions);

    const activeConditions: { type: ConditionType; group: ConditionGroup }[] = [];

    for (const type of CONDITION_TYPES) {
        const jsonLogic = conditions[type.id as keyof typeof conditions];
        if (jsonLogic) {
            console.log(`[ConditionsEditor] Parsing ${type.id}:`, jsonLogic);
            const group = jsonLogicToGroup(jsonLogic as Record<string, any>);
            console.log(`[ConditionsEditor] Parsed group:`, group);
            if (group) {
                activeConditions.push({ type: type.id, group });
            }
        }
    }

    const handleAddCondition = (conditionType: ConditionType) => {
        const defaultRule: SimpleRule = {
            field: availableFields[0] ?? "isNew",
            operator: "==",
            value: ""
        };

        const defaultGroup: ConditionGroup = {
            logic: "and",
            rules: [defaultRule]
        };

        const jsonLogic = groupToJsonLogic(defaultGroup);
        setFieldValue(`conditions.${conditionType}`, jsonLogic);
    };

    const handleGroupChange = (type: ConditionType, group: ConditionGroup) => {
        const jsonLogic = groupToJsonLogic(group);
        setFieldValue(`conditions.${type}`, jsonLogic);
    };

    const handleRemoveCondition = (type: ConditionType) => {
        const newConditions = { ...conditions };
        delete (newConditions as any)[type];
        if (Object.keys(newConditions).length === 0) {
            setFieldValue("conditions", undefined);
        } else {
            setFieldValue("conditions", newConditions);
        }
    };

    // Condition types that aren't already used
    const availableConditionTypes = CONDITION_TYPES.filter(
        ct => !conditions[ct.id as keyof typeof conditions]
    );

    return (
        <div className="flex flex-col gap-4">
            <Typography variant="caption" color="secondary">
                Add conditions to dynamically control this field based on other field values or user context.
            </Typography>

            {/* Active conditions */}
            {activeConditions.length > 0 && (
                <div className="flex flex-col gap-3">
                    {activeConditions.map(({ type, group }) => (
                        <ConditionGroupRow
                            key={type}
                            conditionType={type}
                            group={group}
                            onGroupChange={(newGroup) => handleGroupChange(type, newGroup)}
                            onRemove={() => handleRemoveCondition(type)}
                            disabled={disabled}
                            availableFields={availableFields}
                            collectionProperties={collectionProperties}
                            showErrors={submitCount > 0}
                        />
                    ))}
                </div>
            )}

            {/* Add new condition - click to add directly */}
            {availableConditionTypes.length > 0 && (
                <Select
                    value=""
                    onValueChange={(value) => handleAddCondition(value as ConditionType)}
                    disabled={disabled}
                    size="small"
                    placeholder="+ Add condition..."
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

            {activeConditions.length === 0 && availableConditionTypes.length === 0 && (
                <Typography variant="caption" color="disabled" className="text-center py-4">
                    All condition types are configured.
                </Typography>
            )}
        </div>
    );
}
