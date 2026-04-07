import type { Properties } from "@rebasepro/types/cms";
import type { ArrayProperty, MapProperty, NumberProperty, Property, BooleanProperty, DateProperty, GeopointProperty, ReferenceProperty, RelationProperty, StringProperty } from "@rebasepro/types/cms";
;
import { z, ZodTypeAny } from "zod";
import { enumToObjectEntries, getValueInPath, hydrateRegExp, isPropertyBuilder } from "@rebasepro/common";

export type CustomFieldValidator = (props: {
    name: string,
    value: any,
    property: Property,
    entityId?: string | number,
    parentProperty?: MapProperty | ArrayProperty,
}) => Promise<boolean>;

interface PropertyContext<P extends Property> {
    property: P,
    parentProperty?: MapProperty | ArrayProperty,
    entityId?: string | number,
    customFieldValidator?: CustomFieldValidator,
    name?: any
}

export function getEntitySchema<M extends Record<string, any>>(
    entityId: string | number | undefined,
    properties: Properties,
    customFieldValidator?: CustomFieldValidator): z.ZodObject<any> {
    const shape: Record<string, ZodTypeAny> = {};
    Object.entries(properties as Record<string, Property>)
        .forEach(([name, property]) => {
            const isStringOrNumber = property.type === "string" || property.type === "number";
            const isIdAndAuto = isStringOrNumber && "isId" in property && typeof property.isId === "string" && property.isId !== "manual";
            if (entityId === undefined && isIdAndAuto) {
                return; // Skip validation for auto-generated IDs on new entities
            }
            shape[name] = mapPropertyToZod({
                property: property as Property,
                customFieldValidator,
                name,
                entityId
            });
        });
    return z.object(shape).passthrough();
}

/**
 * @deprecated Use getEntitySchema instead
 */
export const getYupEntitySchema = getEntitySchema;

export function mapPropertyToZod(propertyContext: PropertyContext<Property>): ZodTypeAny {

    const property = propertyContext.property;
    if (isPropertyBuilder(property)) {
        console.error("Error in property", propertyContext);
        // Return a schema that always fails
        return z.any().refine(
            () => false,
            { message: "Invalid property configuration: property builder should be resolved" }
        );
    }

    if (property.type === "string") {
        return getZodStringSchema(propertyContext as PropertyContext<StringProperty>);
    } else if (property.type === "number") {
        return getZodNumberSchema(propertyContext as PropertyContext<NumberProperty>);
    } else if (property.type === "boolean") {
        return getZodBooleanSchema(propertyContext as PropertyContext<BooleanProperty>);
    } else if (property.type === "map") {
        return getZodMapObjectSchema(propertyContext as PropertyContext<MapProperty>);
    } else if (property.type === "array") {
        return getZodArraySchema(propertyContext as PropertyContext<ArrayProperty>);
    } else if (property.type === "date") {
        return getZodDateSchema(propertyContext as PropertyContext<DateProperty>);
    } else if (property.type === "geopoint") {
        return getZodGeoPointSchema(propertyContext as PropertyContext<GeopointProperty>);
    } else if (property.type === "reference") {
        return getZodReferenceSchema(propertyContext as PropertyContext<ReferenceProperty>);
    } else if (property.type === "relation") {
        return getZodRelationSchema(propertyContext as PropertyContext<RelationProperty>);
    }

    // Log the error but don't crash the form
    console.error("Unsupported data type in zod mapping", property);
    const dataType = "dataType" in (property as Record<string, unknown>) ? String((property as Record<string, unknown>).dataType) : "unknown";
    return z.any().refine(
        () => false,
        { message: `Unsupported data type: ${dataType}` }
    );
}

/**
 * @deprecated Use mapPropertyToZod instead
 */
export const mapPropertyToYup = mapPropertyToZod;

export function getZodMapObjectSchema({
    property,
    entityId,
    customFieldValidator,
    name
}: PropertyContext<MapProperty>): ZodTypeAny {
    const shape: Record<string, ZodTypeAny> = {};
    const validation = property.validation;
    if (property.properties)
        Object.entries(property.properties).forEach(([childName, childProperty]) => {
            const typedChildProperty = childProperty as Readonly<Property>;
            try {
                shape[childName] = mapPropertyToZod({
                    property: typedChildProperty,
                    parentProperty: property as MapProperty,
                    customFieldValidator,
                    name: `${name}[${childName}]`,
                    entityId
                });
            } catch (e: unknown) {
                console.error(`Error creating validation schema for property ${childName}:`, e);
                shape[childName] = z.any().refine(
                    () => false,
                    { message: `Validation error: ${e instanceof Error ? e.message : "Unknown error"}` }
                );
            }
        });

    let schema: ZodTypeAny = z.object(shape).passthrough();
    if (validation?.required) {
        schema = schema.nullable().optional().refine(
            (value) => value !== undefined,
            { message: validation?.requiredMessage ? validation.requiredMessage : "Required" }
        );
    } else {
        schema = schema.nullable().optional();
    }
    return schema;
}

function getZodStringSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<StringProperty>): ZodTypeAny {
    let schema: ZodTypeAny = z.string().nullable().optional();
    const validation = property.validation;

    const isRequired = validation?.required || property.isId === true || property.isId === "manual";

    if (property.enum) {
        if (isRequired) {
            schema = z.string().nullable().optional().refine(
                (value) => value !== undefined && value !== null && value !== "",
                { message: validation?.requiredMessage ? validation.requiredMessage : "Required" }
            );
        }
        const entries = enumToObjectEntries(property.enum);
        const allowedValues = (isRequired ? entries : [...entries, null])
            .map((enumValueConfig) => enumValueConfig?.id ?? null);
        schema = schema.refine(
            (value: any) => allowedValues.includes(value),
            { message: `Must be one of: ${allowedValues.filter(Boolean).join(", ")}` }
        );
    }

    if (isRequired && !property.enum) {
        schema = schema.refine(
            (value: any) => value !== undefined && value !== null && value !== "",
            { message: validation?.requiredMessage ? validation.requiredMessage : "Required" }
        );
    }

    if (validation) {
        if (validation.unique && customFieldValidator && name)
            schema = schema.refine(
                (value: any) =>
                    customFieldValidator({
                        name,
                        property,
                        parentProperty,
                        value,
                        entityId
                    }),
                { message: "This value already exists and should be unique" }
            );
        if (validation.min || validation.min === 0) schema = schema.refine(
            (value: any) => value == null || value.length >= validation.min!,
            { message: `${property.name} must be min ${validation.min} characters long` }
        );
        if (validation.max || validation.max === 0) schema = schema.refine(
            (value: any) => value == null || value.length <= validation.max!,
            { message: `${property.name} must be max ${validation.max} characters long` }
        );
        if (validation.matches) {
            const regExp = typeof validation.matches === "string" ? hydrateRegExp(validation.matches) : validation.matches;
            if (regExp) {
                schema = schema.refine(
                    (value: any) => value == null || regExp.test(value),
                    { message: validation.matchesMessage ?? "Invalid format" }
                );
            }
        }
        if (validation.trim) schema = z.preprocess((v: any) => typeof v === "string" ? v.trim() : v, schema);
        if (validation.lowercase) schema = z.preprocess((v: any) => typeof v === "string" ? v.toLowerCase() : v, schema);
        if (validation.uppercase) schema = z.preprocess((v: any) => typeof v === "string" ? v.toUpperCase() : v, schema);
        if (property.email) schema = schema.refine(
            (value: any) => value == null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            { message: `${property.name} must be an email` }
        );
        if (property.url) {
            if (!property.storage || property.storage?.storeUrl) {
                schema = schema.refine(
                    (value: any) => {
                        if (value == null) return true;
                        try {
                            new URL(value);
                            return true;
                        } catch {
                            return false;
                        }
                    },
                    { message: `${property.name} must be a url` }
                );
            } else {
                console.warn(`Property ${property.name} has a url validation but its storage configuration is not set to store urls`);
            }
        }
    }
    return schema;
}

function getZodNumberSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<NumberProperty>): ZodTypeAny {
    const validation = property.validation;
    // Accept number or null, coerce non-numbers to fail
    let schema: ZodTypeAny = z.preprocess(
        (val) => {
            if (val === null || val === undefined) return null;
            if (typeof val === "number") return val;
            const n = Number(val);
            return isNaN(n) ? val : n; // pass through non-numeric to let refine catch it
        },
        z.number({ invalid_type_error: "Must be a number" }).nullable()
    );

    const isRequired = validation?.required || property.isId === true || property.isId === "manual";

    if (isRequired) {
        schema = schema.refine(
            (value: any) => value !== undefined && value !== null,
            { message: validation?.requiredMessage ? validation.requiredMessage : "Required" }
        );
    }

    if (validation) {
        if (validation.unique && customFieldValidator && name)
            schema = schema.refine(
                (value: any) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }),
                { message: "This value already exists and should be unique" }
            );
        if (validation.min || validation.min === 0) schema = schema.refine(
            (value: any) => value == null || value >= validation.min!,
            { message: `${property.name} must be higher or equal to ${validation.min}` }
        );
        if (validation.max || validation.max === 0) schema = schema.refine(
            (value: any) => value == null || value <= validation.max!,
            { message: `${property.name} must be lower or equal to ${validation.max}` }
        );
        if (validation.lessThan || validation.lessThan === 0) schema = schema.refine(
            (value: any) => value == null || value < validation.lessThan!,
            { message: `${property.name} must be higher than ${validation.lessThan}` }
        );
        if (validation.moreThan || validation.moreThan === 0) schema = schema.refine(
            (value: any) => value == null || value > validation.moreThan!,
            { message: `${property.name} must be lower than ${validation.moreThan}` }
        );
        if (validation.positive) schema = schema.refine(
            (value: any) => value == null || value > 0,
            { message: `${property.name} must be positive` }
        );
        if (validation.negative) schema = schema.refine(
            (value: any) => value == null || value < 0,
            { message: `${property.name} must be negative` }
        );
        if (validation.integer) schema = schema.refine(
            (value: any) => value == null || Number.isInteger(value),
            { message: `${property.name} must be an integer` }
        );
    }
    return schema;
}

function getZodGeoPointSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<GeopointProperty>): ZodTypeAny {
    let schema: ZodTypeAny = z.object({}).passthrough().nullable().optional();
    const validation = property.validation;

    if (validation?.unique && customFieldValidator && name)
        schema = schema.refine(
            (value: any) => customFieldValidator({
                name,
                property,
                parentProperty,
                value,
                entityId
            }),
            { message: "This value already exists and should be unique" }
        );
    if (validation?.required) {
        schema = schema.refine(
            (value: any) => value !== undefined && value !== null,
            { message: validation.requiredMessage ? validation.requiredMessage : "Required" }
        );
    }
    return schema;
}

function getZodDateSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<DateProperty>): ZodTypeAny {
    if (property.autoValue) {
        return z.date().nullable().optional();
    }
    // Accept Date objects and null, reject everything else
    let schema: ZodTypeAny = z.custom<Date | null | undefined>(
        (v) => v === null || v === undefined || v instanceof Date,
        { message: "Expected a Date" }
    ).optional();
    const validation = property.validation;

    if (validation) {
        if (validation.required) {
            schema = schema.refine(
                (value: any) => value !== undefined && value !== null,
                { message: validation?.requiredMessage ? validation.requiredMessage : "Required" }
            );
        }
        if (validation.unique && customFieldValidator && name)
            schema = schema.refine(
                (value: any) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }),
                { message: "This value already exists and should be unique" }
            );
        if (validation.min) schema = schema.refine(
            (value: any) => value == null || value >= validation.min!,
            { message: `${property.name} must be after ${validation.min}` }
        );
        if (validation.max) schema = schema.refine(
            (value: any) => value == null || value <= validation.max!,
            { message: `${property.name} must be before ${validation.min}` }
        );
    }
    return schema;
}

function getZodReferenceSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<ReferenceProperty>): ZodTypeAny {
    let schema: ZodTypeAny = z.object({}).passthrough().nullable().optional();
    const validation = property.validation;

    if (validation) {
        if (validation.required) {
            schema = schema.refine(
                (value: any) => value !== undefined && value !== null,
                { message: validation?.requiredMessage ? validation.requiredMessage : "Required" }
            );
        }
        if (validation.unique && customFieldValidator && name)
            schema = schema.refine(
                (value: any) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }),
                { message: "This value already exists and should be unique" }
            );
    }
    return schema;
}

function getZodRelationSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<RelationProperty>): ZodTypeAny {
    const isMany = property.relation?.cardinality === "many";
    let schema: ZodTypeAny = isMany
        ? z.array(z.object({}).passthrough()).nullable().optional()
        : z.object({}).passthrough().nullable().optional();
    const validation = property.validation;

    if (validation) {
        if (validation.required) {
            schema = schema.refine(
                (value: any) => {
                    if (isMany) {
                        return value !== undefined && value !== null && Array.isArray(value) && value.length > 0;
                    }
                    return value !== undefined && value !== null;
                },
                { message: validation?.requiredMessage ? validation.requiredMessage : "Required" }
            );
        }
        if (validation.unique && customFieldValidator && name)
            schema = schema.refine(
                (value: any) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }),
                { message: "This value already exists and should be unique" }
            );
    }
    return schema;
}

function getZodBooleanSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<BooleanProperty>): ZodTypeAny {
    let schema: ZodTypeAny = z.boolean().nullable().optional();
    const validation = property.validation;

    if (validation) {
        if (validation.required) {
            schema = schema.refine(
                (value: any) => value !== undefined && value !== null,
                { message: validation?.requiredMessage ? validation.requiredMessage : "Required" }
            );
        }
        if (validation.unique && customFieldValidator && name)
            schema = schema.refine(
                (value: any) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }),
                { message: "This value already exists and should be unique" }
            );
    }
    return schema;
}

function hasUniqueInArrayModifier(property: Property): boolean | [string, Property][] {
    if (property.validation?.uniqueInArray) {
        return true;
    } else if (property.type === "map" && property.properties) {
        return Object.entries(property.properties)
            .filter(([key, childProperty]) => (childProperty as Readonly<Property>).validation?.uniqueInArray) as [string, Property][];
    }
    return false;
}

function getZodArraySchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<ArrayProperty>): ZodTypeAny {

    let arraySchema: ZodTypeAny = z.array(z.any()).nullable().optional();

    if (property.of) {
        if (Array.isArray(property.of)) {
            const zodProperties: Record<string, ZodTypeAny> = {};
            (property.of as Property[]).forEach((p, index) => {
                try {
                    zodProperties[`${name}[${index}]`] = mapPropertyToZod({
                        property: p as Property,
                        parentProperty: property,
                        entityId
                    });
                } catch (e: unknown) {
                    console.error(`Error creating validation schema for array item ${index}:`, e);
                    zodProperties[`${name}[${index}]`] = z.any().refine(
                        () => false,
                        { message: `Validation error: ${e instanceof Error ? e.message : "Unknown error"}` }
                    );
                }
            });
            arraySchema = z.array(
                z.any().superRefine(async (object, ctx) => {
                    // Find the matching schema from zodProperties based on the path
                    const parentPath = ctx.path.slice(0, -1).join(".");
                    const index = ctx.path[ctx.path.length - 1];
                    const key = parentPath ? `${parentPath}[${index}]` : `${name}[${index}]`;
                    const zodProperty = getValueInPath(zodProperties, key) as ZodTypeAny | undefined;
                    if (zodProperty) {
                        const result = await zodProperty.safeParseAsync(object);
                        if (!result.success) {
                            result.error.issues.forEach((issue) => {
                                ctx.addIssue(issue);
                            });
                        }
                    }
                })
            ).nullable().optional();
        } else {
            try {
                const ofSchema = mapPropertyToZod({
                    property: property.of,
                    parentProperty: property,
                    entityId
                });
                arraySchema = z.array(ofSchema).nullable().optional();
            } catch (e: unknown) {
                console.error(`Error creating validation schema for array of property:`, e);
                arraySchema = z.array(z.any().refine(
                    () => false,
                    { message: `Validation error: ${e instanceof Error ? e.message : "Unknown error"}` }
                )).nullable().optional();
            }
            const arrayUniqueFields = hasUniqueInArrayModifier(property.of);
            if (arrayUniqueFields) {
                if (typeof arrayUniqueFields === "boolean") {
                    arraySchema = arraySchema.refine(
                        (values: any) => !values || values.length === new Set(values.map((v: any) => v)).size,
                        { message: `${property.name} should have unique values within the array` }
                    );
                } else if (Array.isArray(arrayUniqueFields)) {
                    arrayUniqueFields.forEach(([fieldName, childProperty]) => {
                        arraySchema = arraySchema.refine(
                            (values: any) => !values || values.length === new Set(values.map((v: any) => v && v[fieldName])).size,
                            { message: `${property.name} → ${childProperty.name ?? fieldName}: should have unique values within the array` }
                        );
                    });
                }
            }
        }
    }
    const validation = property.validation;

    if (validation) {
        if (validation.required) {
            arraySchema = arraySchema.refine(
                (value: any) => value !== undefined && value !== null && value.length > 0,
                { message: validation?.requiredMessage ? validation.requiredMessage : "Required" }
            );
        }
        if (validation.min || validation.min === 0) arraySchema = arraySchema.refine(
            (value: any) => !value || value.length >= validation.min!,
            { message: `${property.name} should be min ${validation.min} entries long` }
        );
        if (validation.max) arraySchema = arraySchema.refine(
            (value: any) => !value || value.length <= validation.max!,
            { message: `${property.name} should be max ${validation.max} entries long` }
        );
        // Handle uniqueInArray at the array level
        if (validation.uniqueInArray) {
            arraySchema = arraySchema.refine(
                (values: any) => !values || values.length === new Set(values.map((v: any) => v)).size,
                { message: `${property.name} should have unique values within the array` }
            );
        }
    }
    return arraySchema;
}
