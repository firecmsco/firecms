import {
    ArrayProperty,
    MapProperty,
    NumberProperty,
    Property,
    BooleanProperty,
    DateProperty,
    GeopointProperty,
    Properties,
    ReferenceProperty,
    RelationProperty,
    StringProperty
} from "@firecms/types";
import * as yup from "yup";
import { AnySchema, ArraySchema, BooleanSchema, DateSchema, NumberSchema, ObjectSchema, StringSchema } from "yup";
import { enumToObjectEntries, getValueInPath, hydrateRegExp, isPropertyBuilder } from "@firecms/common";

// Add custom unique function for array values
declare module "yup" {
    // tslint:disable-next-line
    interface ArraySchema<TIn extends any[] | null | undefined, TContext, TDefault = undefined, TFlags extends yup.Flags = ""> {
        uniqueInArray(mapper: (a: any) => any, message: string): ArraySchema<TIn, TContext, TDefault, TFlags>;
    }
}
yup.addMethod(yup.array, "uniqueInArray", function (
    mapper = (a: any) => a,
    message: string
) {
    return this.test("uniqueInArray", message, values => {
        return !values || values.length === new Set(values.map(mapper)).size;
    });
});

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
    entityId: string | number,
    customFieldValidator?: CustomFieldValidator,
    name?: any
}

export function getYupEntitySchema<M extends Record<string, any>>(
    entityId: string | number,
    properties: Properties,
    customFieldValidator?: CustomFieldValidator): ObjectSchema<any> {
    const objectSchema: any = {};
    Object.entries(properties as Record<string, Property>)
        .forEach(([name, property]) => {
            objectSchema[name] = mapPropertyToYup({
                property: property as Property,
                customFieldValidator,
                name,
                entityId
            });
        });
    return yup.object().shape(objectSchema);
}

export function mapPropertyToYup(propertyContext: PropertyContext<Property>): AnySchema<unknown> {

    const property = propertyContext.property;
    if (isPropertyBuilder(property)) {
        console.error("Error in property", propertyContext);
        throw Error("Trying to create a yup mapping from a property builder. Please use resolved properties only");
    }

    if (property.type === "string") {
        return getYupStringSchema(propertyContext as PropertyContext<StringProperty>);
    } else if (property.type === "number") {
        return getYupNumberSchema(propertyContext as PropertyContext<NumberProperty>);
    } else if (property.type === "boolean") {
        return getYupBooleanSchema(propertyContext as PropertyContext<BooleanProperty>);
    } else if (property.type === "map") {
        return getYupMapObjectSchema(propertyContext as PropertyContext<MapProperty>);
    } else if (property.type === "array") {
        return getYupArraySchema(propertyContext as PropertyContext<ArrayProperty>);
    } else if (property.type === "date") {
        return getYupDateSchema(propertyContext as PropertyContext<DateProperty>);
    } else if (property.type === "geopoint") {
        return getYupGeoPointSchema(propertyContext as PropertyContext<GeopointProperty>);
    } else if (property.type === "reference") {
        return getYupReferenceSchema(propertyContext as PropertyContext<ReferenceProperty>);
    } else if (property.type === "relation") {
        return getYupRelationSchema(propertyContext as PropertyContext<RelationProperty>);
    }
    console.error("Unsupported data type in yup mapping", property)
    throw Error("Unsupported data type in yup mapping");
}

export function getYupMapObjectSchema({
    property,
    entityId,
    customFieldValidator,
    name
}: PropertyContext<MapProperty>): ObjectSchema<any> {
    const objectSchema: any = {};
    const validation = property.validation;
    if (property.properties)
        Object.entries(property.properties).forEach(([childName, childProperty]: [string, Property]) => {
            objectSchema[childName] = mapPropertyToYup({
                property: childProperty,
                parentProperty: property as MapProperty,
                customFieldValidator,
                name: `${name}[${childName}]`,
                entityId
            });
        });

    const shape = yup.object().shape(objectSchema);
    if (validation?.required) {
        // In yup v0.x, .required().nullable(true) allowed null values
        // To match this behavior: reject undefined but allow null
        return shape.nullable().test(
            "required",
            validation?.requiredMessage ? validation.requiredMessage : "Required",
            (value) => value !== undefined
        ) as any;
    }
    return yup.object().shape(shape.fields).default(undefined).nullable().optional() as any;
}

function getYupStringSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<StringProperty>): StringSchema {
    let schema: StringSchema<any> = yup.string().nullable();
    const validation = property.validation;

    if (property.enum) {
        if (validation?.required) {
            schema = schema.test(
                "required",
                validation?.requiredMessage ? validation.requiredMessage : "Required",
                (value) => value !== undefined && value !== null && value !== ""
            );
        }
        const entries = enumToObjectEntries(property.enum);
        schema = schema.oneOf(
            (validation?.required ? entries : [...entries, null])
                .map((enumValueConfig) => enumValueConfig?.id ?? null)
        );
    }

    if (validation) {
        if (validation.required) {
            schema = schema.test(
                "required",
                validation?.requiredMessage ? validation.requiredMessage : "Required",
                (value) => value !== undefined && value !== null && value !== ""
            );
        }
        if (validation.unique && customFieldValidator && name)
            schema = schema.test("unique", "This value already exists and should be unique",
                (value, context) =>
                    customFieldValidator({
                        name,
                        property,
                        parentProperty,
                        value,
                        entityId
                    }));
        if (validation.min || validation.min === 0) schema = schema.min(validation.min, `${property.name} must be min ${validation.min} characters long`);
        if (validation.max || validation.max === 0) schema = schema.max(validation.max, `${property.name} must be max ${validation.max} characters long`);
        if (validation.matches) {
            const regExp = typeof validation.matches === "string" ? hydrateRegExp(validation.matches) : validation.matches;
            if (regExp) {
                schema = schema.matches(regExp, validation.matchesMessage ? { message: validation.matchesMessage } : undefined)
            }
        }
        if (validation.trim) schema = schema.trim();
        if (validation.lowercase) schema = schema.lowercase();
        if (validation.uppercase) schema = schema.uppercase();
        if (property.email) schema = schema.email(`${property.name} must be an email`);
        if (property.url) {
            if (!property.storage || property.storage?.storeUrl) {
                schema = schema.url(`${property.name} must be a url`);
            } else {
                console.warn(`Property ${property.name} has a url validation but its storage configuration is not set to store urls`);
            }
        }
    }
    return schema;
}

function getYupNumberSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<NumberProperty>): NumberSchema {
    const validation = property.validation;
    let schema: NumberSchema<any> = yup.number().nullable().typeError("Must be a number");

    if (validation) {
        if (validation.required) {
            schema = schema.test(
                "required",
                validation.requiredMessage ? validation.requiredMessage : "Required",
                (value) => value !== undefined && value !== null
            );
        }
        if (validation.unique && customFieldValidator && name)
            schema = schema.test("unique",
                "This value already exists and should be unique",
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }));
        if (validation.min || validation.min === 0) schema = schema.min(validation.min, `${property.name} must be higher or equal to ${validation.min}`);
        if (validation.max || validation.max === 0) schema = schema.max(validation.max, `${property.name} must be lower or equal to ${validation.max}`);
        if (validation.lessThan || validation.lessThan === 0) schema = schema.lessThan(validation.lessThan, `${property.name} must be higher than ${validation.lessThan}`);
        if (validation.moreThan || validation.moreThan === 0) schema = schema.moreThan(validation.moreThan, `${property.name} must be lower than ${validation.moreThan}`);
        if (validation.positive) schema = schema.positive(`${property.name} must be positive`);
        if (validation.negative) schema = schema.negative(`${property.name} must be negative`);
        if (validation.integer) schema = schema.integer(`${property.name} must be an integer`);
    }
    return schema;
}

function getYupGeoPointSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<GeopointProperty>): AnySchema {
    let schema: ObjectSchema<any> = yup.object().nullable() as ObjectSchema<any>;
    const validation = property.validation;

    if (validation?.unique && customFieldValidator && name)
        schema = schema.test("unique",
            "This value already exists and should be unique",
            (value) => customFieldValidator({
                name,
                property,
                parentProperty,
                value,
                entityId
            }));
    if (validation?.required) {
        schema = schema.test(
            "required",
            validation.requiredMessage ? validation.requiredMessage : "Required",
            (value) => value !== undefined && value !== null
        );
    }
    return schema;
}

function getYupDateSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<DateProperty>): AnySchema | DateSchema {
    if (property.autoValue) {
        return yup.date().nullable();
    }
    let schema: DateSchema<any> = yup.date().nullable();
    const validation = property.validation;

    if (validation) {
        if (validation.required) {
            schema = schema.test(
                "required",
                validation?.requiredMessage ? validation.requiredMessage : "Required",
                (value) => value !== undefined && value !== null
            );
        }
        if (validation.unique && customFieldValidator && name)
            schema = schema.test("unique",
                "This value already exists and should be unique",
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }));
        if (validation.min) schema = schema.min(validation.min, `${property.name} must be after ${validation.min}`);
        if (validation.max) schema = schema.max(validation.max, `${property.name} must be before ${validation.min}`);
    }
    return schema.transform((v: any) => (v instanceof Date ? v : null));
}

function getYupReferenceSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<ReferenceProperty>): AnySchema {
    let schema: ObjectSchema<any> = yup.object().nullable() as ObjectSchema<any>;
    const validation = property.validation;

    if (validation) {
        if (validation.required) {
            schema = schema.test(
                "required",
                validation?.requiredMessage ? validation.requiredMessage : "Required",
                (value) => value !== undefined && value !== null
            );
        }
        if (validation.unique && customFieldValidator && name)
            schema = schema.test("unique",
                "This value already exists and should be unique",
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }));
    }
    return schema;
}

function getYupRelationSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<RelationProperty>): AnySchema {
    let schema: ObjectSchema<any> = yup.object().nullable() as ObjectSchema<any>;
    const validation = property.validation;

    if (validation) {
        if (validation.required) {
            schema = schema.test(
                "required",
                validation?.requiredMessage ? validation.requiredMessage : "Required",
                (value) => value !== undefined && value !== null
            );
        }
        if (validation.unique && customFieldValidator && name)
            schema = schema.test("unique",
                "This value already exists and should be unique",
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }));
    }
    return schema;
}

function getYupBooleanSchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<BooleanProperty>): BooleanSchema {
    let schema: BooleanSchema<any> = yup.boolean().nullable();
    const validation = property.validation;

    if (validation) {
        if (validation.required) {
            schema = schema.test(
                "required",
                validation?.requiredMessage ? validation.requiredMessage : "Required",
                (value) => value !== undefined && value !== null
            );
        }
        if (validation.unique && customFieldValidator && name)
            schema = schema.test("unique",
                "This value already exists and should be unique",
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }));
    }
    return schema;
}

function hasUniqueInArrayModifier(property: Property): boolean | [string, Property][] {
    if (property.validation?.uniqueInArray) {
        return true;
    } else if (property.type === "map" && property.properties) {
        return Object.entries(property.properties)
            .filter(([key, childProperty]) => childProperty.validation?.uniqueInArray);
    }
    return false;
}

function getYupArraySchema({
    property,
    parentProperty,
    customFieldValidator,
    name,
    entityId
}: PropertyContext<ArrayProperty>): AnySchema<any> {

    let arraySchema: any = yup.array().nullable();

    if (property.of) {
        if (Array.isArray(property.of)) {
            const yupProperties = (property.of as Property[]).map((p, index) => ({
                [`${name}[${index}]`]: mapPropertyToYup({
                    property: p as Property,
                    parentProperty: property,
                    entityId
                })
            })).reduce((a, b) => ({ ...a, ...b }), {});
            return yup.array().nullable().of(
                yup.mixed().test(
                    "Dynamic object validation",
                    "Dynamic object validation error",
                    (object, context) => {
                        const yupProperty = getValueInPath(yupProperties, context.path);
                        return yupProperty.validate(object);
                    }
                )
            );
        } else {
            arraySchema = arraySchema.of(mapPropertyToYup({
                property: property.of,
                parentProperty: property,
                entityId
            }));
            const arrayUniqueFields = hasUniqueInArrayModifier(property.of);
            if (arrayUniqueFields) {
                if (typeof arrayUniqueFields === "boolean") {
                    arraySchema = arraySchema.uniqueInArray((v: any) => v, `${property.name} should have unique values within the array`);
                } else if (Array.isArray(arrayUniqueFields)) {
                    arrayUniqueFields.forEach(([name, childProperty]) => {
                        arraySchema = arraySchema.uniqueInArray((v: any) => v && v[name], `${property.name} → ${childProperty.name ?? name}: should have unique values within the array`);
                    });
                }
            }
        }
    }
    const validation = property.validation;

    if (validation) {
        if (validation.required) {
            arraySchema = arraySchema.test(
                "required",
                validation?.requiredMessage ? validation.requiredMessage : "Required",
                (value: any) => value !== undefined && value !== null && value.length > 0
            );
        }
        if (validation.min || validation.min === 0) arraySchema = arraySchema.min(validation.min, `${property.name} should be min ${validation.min} entries long`);
        if (validation.max) arraySchema = arraySchema.max(validation.max, `${property.name} should be max ${validation.max} entries long`);
        // Handle uniqueInArray at the array level (in addition to the of.validation check above)
        if (validation.uniqueInArray) {
            arraySchema = arraySchema.uniqueInArray((v: any) => v, `${property.name} should have unique values within the array`);
        }
    }
    return arraySchema;
}
