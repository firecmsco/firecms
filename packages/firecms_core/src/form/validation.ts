import {
    EntityReference,
    EntityRelation,
    GeoPoint,
    ResolvedArrayProperty, ResolvedBooleanProperty, ResolvedDateProperty, ResolvedGeopointProperty,
    ResolvedMapProperty, ResolvedNumberProperty,
    ResolvedProperties,
    ResolvedProperty, ResolvedReferenceProperty, ResolvedRelationProperty, ResolvedStringProperty, StringProperty
} from "@firecms/types";
import * as yup from "yup";
import { AnySchema, ArraySchema, BooleanSchema, DateSchema, NumberSchema, ObjectSchema, StringSchema } from "yup";
import { enumToObjectEntries, getValueInPath, hydrateRegExp, isPropertyBuilder } from "@firecms/common";

// Add custom unique function for array values
declare module "yup" {
    // tslint:disable-next-line
    interface ArraySchema<T> {
        uniqueInArray(mapper: (a: T) => T, message: string): ArraySchema<T>;
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
    property: ResolvedProperty,
    entityId?: string | number,
    parentProperty?: ResolvedMapProperty | ResolvedArrayProperty,
}) => Promise<boolean>;

interface PropertyContext<P extends ResolvedProperty> {
    property: P,
    parentProperty?: ResolvedMapProperty | ResolvedArrayProperty,
    entityId: string | number,
    customFieldValidator?: CustomFieldValidator,
    name?: any
}

export function getYupEntitySchema<M extends Record<string, any>>(
    entityId: string | number,
    properties: ResolvedProperties,
    customFieldValidator?: CustomFieldValidator): ObjectSchema<any> {
    const objectSchema: any = {};
    Object.entries(properties as Record<string, ResolvedProperty>)
        .forEach(([name, property]) => {
            objectSchema[name] = mapPropertyToYup({
                property: property as ResolvedProperty,
                customFieldValidator,
                name,
                entityId
            });
        });
    return yup.object().shape(objectSchema);
}

export function mapPropertyToYup(propertyContext: PropertyContext<ResolvedProperty>): AnySchema<unknown> {

    const property = propertyContext.property;
    if (isPropertyBuilder(property)) {
        console.error("Error in property", propertyContext);
        throw Error("Trying to create a yup mapping from a property builder. Please use resolved properties only");
    }

    if (property.type === "string") {
        return getYupStringSchema(propertyContext as PropertyContext<ResolvedStringProperty>);
    } else if (property.type === "number") {
        return getYupNumberSchema(propertyContext as PropertyContext<ResolvedNumberProperty>);
    } else if (property.type === "boolean") {
        return getYupBooleanSchema(propertyContext as PropertyContext<ResolvedBooleanProperty>);
    } else if (property.type === "map") {
        return getYupMapObjectSchema(propertyContext as PropertyContext<ResolvedMapProperty>);
    } else if (property.type === "array") {
        return getYupArraySchema(propertyContext as PropertyContext<ResolvedArrayProperty>);
    } else if (property.type === "date") {
        return getYupDateSchema(propertyContext as PropertyContext<ResolvedDateProperty>);
    } else if (property.type === "geopoint") {
        return getYupGeoPointSchema(propertyContext as PropertyContext<ResolvedGeopointProperty>);
    } else if (property.type === "reference") {
        return getYupReferenceSchema(propertyContext as PropertyContext<ResolvedReferenceProperty>);
    } else if (property.type === "relation") {
        return getYupRelationSchema(propertyContext as PropertyContext<ResolvedRelationProperty>);
    }
    console.error("Unsupported data type in yup mapping", property)
    throw Error("Unsupported data type in yup mapping");
}

export function getYupMapObjectSchema({
                                          property,
                                          entityId,
                                          customFieldValidator,
                                          name
                                      }: PropertyContext<ResolvedMapProperty>): ObjectSchema<any> {
    const objectSchema: any = {};
    const validation = property.validation;
    if (property.properties)
        Object.entries(property.properties).forEach(([childName, childProperty]: [string, ResolvedProperty]) => {
            objectSchema[childName] = mapPropertyToYup({
                property: childProperty,
                parentProperty: property as ResolvedMapProperty,
                customFieldValidator,
                name: `${name}[${childName}]`,
                entityId
            });
        });

    const shape = yup.object().shape(objectSchema);
    if (validation?.required) {
        return shape.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true);
    }
    return yup.object().shape(shape.fields).default(undefined).notRequired().nullable(true);
}

function getYupStringSchema({
                                property,
                                parentProperty,
                                customFieldValidator,
                                name,
                                entityId
                            }: PropertyContext<ResolvedStringProperty>): StringSchema {
    let collection: StringSchema<any> = yup.string();
    const validation = property.validation;
    if (property.enum) {
        if (validation?.required)
            collection = collection.required(validation?.requiredMessage ? validation.requiredMessage : "Required");
        const entries = enumToObjectEntries(property.enum);
        collection = collection.oneOf(
            (validation?.required ? entries : [...entries, null])
                .map((enumValueConfig) => enumValueConfig?.id ?? null)
        ).nullable(true);
    }
    if (validation) {
        collection = validation.required
            ? collection.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true)
            : collection.notRequired().nullable(true);
        if (validation.unique && customFieldValidator && name)
            collection = collection.test("unique", "This value already exists and should be unique",
                (value, context) =>
                    customFieldValidator({
                        name,
                        property,
                        parentProperty,
                        value,
                        entityId
                    }));
        if (validation.min || validation.min === 0) collection = collection.min(validation.min, `${property.name} must be min ${validation.min} characters long`);
        if (validation.max || validation.max === 0) collection = collection.max(validation.max, `${property.name} must be max ${validation.max} characters long`);
        if (validation.matches) {
            const regExp = typeof validation.matches === "string" ? hydrateRegExp(validation.matches) : validation.matches;
            if (regExp) {
                collection = collection.matches(regExp, validation.matchesMessage ? { message: validation.matchesMessage } : undefined)
            }
        }
        if (validation.trim) collection = collection.trim();
        if (validation.lowercase) collection = collection.lowercase();
        if (validation.uppercase) collection = collection.uppercase();
        if (property.email) collection = collection.email(`${property.name} must be an email`);
        if (property.url) {
            if (!property.storage || property.storage?.storeUrl) {
                collection = collection.url(`${property.name} must be a url`);
            } else {
                console.warn(`Property ${property.name} has a url validation but its storage configuration is not set to store urls`);
            }
        }
    } else {
        collection = collection.notRequired().nullable(true);
    }
    return collection;
}

function getYupNumberSchema({
                                property,
                                parentProperty,
                                customFieldValidator,
                                name,
                                entityId
                            }: PropertyContext<ResolvedNumberProperty>): NumberSchema {
    const validation = property.validation;
    let collection: NumberSchema<any> = yup.number().typeError("Must be a number");
    if (validation) {
        collection = validation.required
            ? collection.required(validation.requiredMessage ? validation.requiredMessage : "Required").nullable(true)
            : collection.notRequired().nullable(true);
        if (validation.unique && customFieldValidator && name)
            collection = collection.test("unique",
                "This value already exists and should be unique",
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }));
        if (validation.min || validation.min === 0) collection = collection.min(validation.min, `${property.name} must be higher or equal to ${validation.min}`);
        if (validation.max || validation.max === 0) collection = collection.max(validation.max, `${property.name} must be lower or equal to ${validation.max}`);
        if (validation.lessThan || validation.lessThan === 0) collection = collection.lessThan(validation.lessThan, `${property.name} must be higher than ${validation.lessThan}`);
        if (validation.moreThan || validation.moreThan === 0) collection = collection.moreThan(validation.moreThan, `${property.name} must be lower than ${validation.moreThan}`);
        if (validation.positive) collection = collection.positive(`${property.name} must be positive`);
        if (validation.negative) collection = collection.negative(`${property.name} must be negative`);
        if (validation.integer) collection = collection.integer(`${property.name} must be an integer`);
    } else {
        collection = collection.notRequired().nullable(true);
    }
    return collection;
}

function getYupGeoPointSchema({
                                  property,
                                  parentProperty,
                                  customFieldValidator,
                                  name,
                                  entityId
                              }: PropertyContext<ResolvedGeopointProperty>): AnySchema {
    let collection: ObjectSchema<any> = yup.object();
    const validation = property.validation;
    if (validation?.unique && customFieldValidator && name)
        collection = collection.test("unique",
            "This value already exists and should be unique",
            (value) => customFieldValidator({
                name,
                property,
                parentProperty,
                value,
                entityId
            }));
    if (validation?.required) {
        collection = collection.required(validation.requiredMessage).nullable(true);
    } else {
        collection = collection.notRequired().nullable(true);
    }
    return collection;
}

function getYupDateSchema({
                              property,
                              parentProperty,
                              customFieldValidator,
                              name,
                              entityId
                          }: PropertyContext<ResolvedDateProperty>): AnySchema | DateSchema {
    if (property.autoValue) {
        return yup.object().nullable();
    }
    let collection: DateSchema<any> = yup.date();
    const validation = property.validation;
    if (validation) {
        collection = validation.required
            ? collection.required(validation?.requiredMessage ? validation.requiredMessage : "Required")
            : collection.notRequired();
        if (validation.unique && customFieldValidator && name)
            collection = collection.test("unique",
                "This value already exists and should be unique",
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }));
        if (validation.min) collection = collection.min(validation.min, `${property.name} must be after ${validation.min}`);
        if (validation.max) collection = collection.max(validation.max, `${property.name} must be before ${validation.min}`);
    } else {
        collection = collection.notRequired();
    }
    return collection
        .transform((v: any) => (v instanceof Date ? v : null))
        .nullable();
}

function getYupReferenceSchema({
                                   property,
                                   parentProperty,
                                   customFieldValidator,
                                   name,
                                   entityId
                               }: PropertyContext<ResolvedReferenceProperty>): AnySchema {
    let collection: ObjectSchema<any> = yup.object();
    const validation = property.validation;
    if (validation) {
        collection = validation.required
            ? collection.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true)
            : collection.notRequired().nullable(true);
        if (validation.unique && customFieldValidator && name)
            collection = collection.test("unique",
                "This value already exists and should be unique",
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }));
    } else {
        collection = collection.notRequired().nullable(true);
    }
    return collection;
}

function getYupRelationSchema({
                                  property,
                                  parentProperty,
                                  customFieldValidator,
                                  name,
                                  entityId
                              }: PropertyContext<ResolvedRelationProperty>): AnySchema {
    let collection: ObjectSchema<any> = yup.object();
    const validation = property.validation;
    if (validation) {
        collection = validation.required
            ? collection.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true)
            : collection.notRequired().nullable(true);
        if (validation.unique && customFieldValidator && name)
            collection = collection.test("unique",
                "This value already exists and should be unique",
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }));
    } else {
        collection = collection.notRequired().nullable(true);
    }
    return collection;
}

function getYupBooleanSchema({
                                 property,
                                 parentProperty,
                                 customFieldValidator,
                                 name,
                                 entityId
                             }: PropertyContext<ResolvedBooleanProperty>): BooleanSchema {
    let collection: BooleanSchema<any> = yup.boolean();
    const validation = property.validation;
    if (validation) {
        collection = validation.required
            ? collection.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true)
            : collection.notRequired().nullable(true);
        if (validation.unique && customFieldValidator && name)
            collection = collection.test("unique",
                "This value already exists and should be unique",
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value,
                    entityId
                }));
    } else {
        collection = collection.notRequired().nullable(true);
    }
    return collection;
}

function hasUniqueInArrayModifier(property: ResolvedProperty): boolean | [string, ResolvedProperty][] {
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
                           }: PropertyContext<ResolvedArrayProperty>): AnySchema<any> {

    let arraySchema: ArraySchema<any> = yup.array();

    if (property.of) {
        if (Array.isArray(property.of)) {
            const yupProperties = (property.of as ResolvedProperty[]).map((p, index) => ({
                [`${name}[${index}]`]: mapPropertyToYup({
                    property: p as ResolvedProperty,
                    parentProperty: property,
                    entityId
                })
            })).reduce((a, b) => ({ ...a, ...b }), {});
            return yup.array().of(
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
                    arraySchema = arraySchema.uniqueInArray(v => v, `${property.name} should have unique values within the array`);
                } else if (Array.isArray(arrayUniqueFields)) {
                    arrayUniqueFields.forEach(([name, childProperty]) => {
                            arraySchema = arraySchema.uniqueInArray(v => v && v[name], `${property.name} → ${childProperty.name ?? name}: should have unique values within the array`);
                        }
                    );
                }
            }
        }
    }
    const validation = property.validation;

    if (validation) {
        arraySchema = validation.required
            ? arraySchema.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true)
            : arraySchema.notRequired().nullable(true);
        if (validation.min || validation.min === 0) arraySchema = arraySchema.min(validation.min, `${property.name} should be min ${validation.min} entries long`);
        if (validation.max) arraySchema = arraySchema.max(validation.max, `${property.name} should be max ${validation.max} entries long`);
    } else {
        arraySchema = arraySchema.notRequired().nullable(true);
    }
    return arraySchema;
}
