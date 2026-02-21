import jsonLogic from "json-logic-js";
import {
    AuthController,
    ConditionContext,
    EnumValueConfig,
    JsonLogicRule,
    PropertyConditions,
    Property,
    Role
} from "@firecms/types";

/**
 * Access a nested property from an object via dot notation.
 */
function getIn(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

let operationsRegistered = false;

/**
 * Register custom JSON Logic operations for FireCMS.
 * Call this once at app initialization.
 */
export function registerConditionOperations(): void {
    if (operationsRegistered) return;

    // Check if user has a specific role by ID
    jsonLogic.add_operation("hasRole", function (this: ConditionContext, roleId: string) {
        return this?.user?.roles?.includes(roleId) ?? false;
    });

    // Check if user has any of the specified roles
    jsonLogic.add_operation("hasAnyRole", function (this: ConditionContext, roleIds: string[]) {
        if (!this?.user?.roles || !Array.isArray(roleIds)) return false;
        return roleIds.some(role => this.user.roles.includes(role));
    });

    // Check if a timestamp is today
    jsonLogic.add_operation("isToday", (timestamp: number) => {
        if (!timestamp) return false;
        const date = new Date(timestamp);
        const today = new Date();
        return date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();
    });

    // Check if a timestamp is in the past
    jsonLogic.add_operation("isPast", (timestamp: number) => {
        if (!timestamp) return false;
        return timestamp < Date.now();
    });

    // Check if a timestamp is in the future
    jsonLogic.add_operation("isFuture", (timestamp: number) => {
        if (!timestamp) return false;
        return timestamp > Date.now();
    });

    operationsRegistered = true;
}

/**
 * Evaluate a JSON Logic rule against the given context.
 */
export function evaluateCondition(rule: JsonLogicRule, context: ConditionContext): any {
    // Ensure operations are registered
    registerConditionOperations();
    return jsonLogic.apply(rule, context);
}

/**
 * Convert a value to a format suitable for JSON Logic evaluation.
 * Specifically handles Date objects by converting them to Unix timestamps.
 */
function serializeValueForConditions(value: any): any {
    if (value === null || value === undefined) {
        return value;
    }

    // Handle Date objects
    if (value instanceof Date) {
        return value.getTime();
    }

    // Handle Firestore Timestamp-like objects (have toDate or toMillis)
    if (typeof value?.toMillis === "function") {
        return value.toMillis();
    }
    if (typeof value?.toDate === "function") {
        return value.toDate().getTime();
    }

    // Handle arrays recursively
    if (Array.isArray(value)) {
        return value.map(serializeValueForConditions);
    }

    // Handle plain objects recursively
    if (typeof value === "object") {
        const result: Record<string, any> = {};
        for (const key of Object.keys(value)) {
            result[key] = serializeValueForConditions(value[key]);
        }
        return result;
    }

    return value;
}

/**
 * Build a ConditionContext from the current property resolution context.
 */
export function buildConditionContext(params: {
    propertyKey?: string;
    values?: Record<string, any>;
    previousValues?: Record<string, any>;
    path: string;
    entityId?: string;
    index?: number;
    authController: AuthController;
}): ConditionContext {
    const {
        propertyKey,
        values,
        previousValues,
        path,
        entityId,
        index,
        authController
    } = params;

    const user = authController.user;
    const serializedValues = serializeValueForConditions(values ?? {});
    const serializedPreviousValues = serializeValueForConditions(previousValues ?? values ?? {});

    return {
        values: serializedValues,
        previousValues: serializedPreviousValues,
        propertyValue: propertyKey ? getIn(serializedValues, propertyKey) : undefined,
        path,
        entityId,
        isNew: !entityId,
        index,
        user: {
            uid: user?.uid ?? "",
            email: user?.email ?? null,
            displayName: user?.displayName ?? null,
            photoURL: user?.photoURL ?? null,
            roles: user?.roles?.map((r: Role) => r.id) ?? []
        },
        now: Date.now()
    };
}

/**
 * Apply PropertyConditions to a resolved property, evaluating all JSON Logic rules.
 */
export function applyPropertyConditions(
    property: Property,
    context: ConditionContext
): Property {
    const { conditions } = property;
    if (!conditions) return property;

    let result = { ...property };

    // ═══════════════════════════════════════════════════════════════════════
    // FIELD STATE CONDITIONS
    // ═══════════════════════════════════════════════════════════════════════

    // Evaluate disabled condition
    if (conditions.disabled) {
        const isDisabled = evaluateCondition(conditions.disabled, context);
        if (isDisabled) {
            result.disabled = {
                clearOnDisabled: conditions.clearOnDisabled ?? false,
                disabledMessage: conditions.disabledMessage,
                hidden: false
            };
        }
    }

    // Evaluate hidden condition
    if (conditions.hidden) {
        const isHidden = evaluateCondition(conditions.hidden, context);
        if (isHidden) {
            result.disabled = {
                ...(typeof result.disabled === "object" ? result.disabled : {}),
                hidden: true,
                clearOnDisabled: conditions.clearOnDisabled ?? false
            };
        }
    }

    // Evaluate readOnly condition
    if (conditions.readOnly) {
        const isReadOnly = evaluateCondition(conditions.readOnly, context);
        if (isReadOnly) {
            result.readOnly = true;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION CONDITIONS
    // ═══════════════════════════════════════════════════════════════════════

    // Evaluate required condition
    if (conditions.required !== undefined) {
        const isRequired = evaluateCondition(conditions.required, context);
        result.validation = {
            ...result.validation,
            required: isRequired,
            requiredMessage: conditions.requiredMessage
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VALUE CONDITIONS
    // ═══════════════════════════════════════════════════════════════════════

    // Apply default value for new entities
    if (context.isNew && conditions.defaultValue !== undefined) {
        result.defaultValue = evaluateCondition(conditions.defaultValue, context);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENUM CONDITIONS
    // ═══════════════════════════════════════════════════════════════════════

    if ("enumValues" in result && result.enumValues && (conditions.enumConditions || conditions.allowedEnumValues || conditions.excludedEnumValues)) {
        (result as any).enumValues = applyEnumConditions(
            result.enumValues as EnumValueConfig[],
            conditions,
            context
        );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // REFERENCE CONDITIONS
    // ═══════════════════════════════════════════════════════════════════════

    if (result.type === "reference") {
        if (conditions.referencePath) {
            (result as any).path = evaluateCondition(conditions.referencePath, context);
        }
        if (conditions.referenceFilter) {
            (result as any).forceFilter = evaluateCondition(conditions.referenceFilter, context);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ARRAY CONDITIONS
    // ═══════════════════════════════════════════════════════════════════════

    if (result.type === "array") {
        if (conditions.canAddElements !== undefined) {
            (result as any).canAddElements = evaluateCondition(conditions.canAddElements, context);
        }
        if (conditions.sortable !== undefined) {
            (result as any).sortable = evaluateCondition(conditions.sortable, context);
        }
    }

    return result;
}

/**
 * Convert an object with numeric keys back to an array.
 * Firestore stores arrays as {"0": "a", "1": "b"} to avoid nested arrays.
 */
function objectToArray(obj: unknown): string[] {
    if (Array.isArray(obj)) return obj.map(String);
    if (obj && typeof obj === "object") {
        const keys = Object.keys(obj);
        if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
            return keys
                .sort((a, b) => Number(a) - Number(b))
                .map(k => (obj as Record<string, unknown>)[k])
                .filter((v): v is string => typeof v === "string" || typeof v === "number")
                .map(String);
        }
    }
    return [];
}

/**
 * Apply enum-specific conditions to filter and modify enum values.
 */
function applyEnumConditions(
    enumValues: EnumValueConfig[],
    conditions: PropertyConditions,
    context: ConditionContext
): EnumValueConfig[] {
    let result = [...enumValues];

    // Apply allowedEnumValues filter
    if (conditions.allowedEnumValues) {
        const allowed = evaluateCondition(conditions.allowedEnumValues, context);
        // Handle both array format and object-with-numeric-keys format (Firestore workaround)
        const allowedArray = objectToArray(allowed);
        if (allowedArray.length > 0) {
            result = result.filter(ev => allowedArray.includes(String(ev.id)));
        }
    }

    // Apply excludedEnumValues filter
    if (conditions.excludedEnumValues) {
        const excluded = evaluateCondition(conditions.excludedEnumValues, context);
        // Handle both array format and object-with-numeric-keys format
        const excludedArray = objectToArray(excluded);
        if (excludedArray.length > 0) {
            result = result.filter(ev => !excludedArray.includes(String(ev.id)));
        }
    }

    // Apply individual enum conditions
    if (conditions.enumConditions) {
        result = result
            .map(ev => {
                const evConditions = conditions.enumConditions?.[ev.id];
                if (!evConditions) return ev;

                // Check hidden condition first
                if (evConditions.hidden && evaluateCondition(evConditions.hidden, context)) {
                    return null; // Will be filtered out
                }

                // Check disabled condition
                if (evConditions.disabled && evaluateCondition(evConditions.disabled, context)) {
                    return {
                        ...ev,
                        disabled: true
                    };
                }

                return ev;
            })
            .filter((ev): ev is EnumValueConfig => ev !== null);
    }

    return result;
}
