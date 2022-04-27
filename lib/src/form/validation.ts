import {
    EntityReference,
    GeoPoint,
    ResolvedArrayProperty,
    ResolvedMapProperty,
    ResolvedProperties,
    ResolvedProperty
} from "../models";
import * as yup from "yup";
import {
    AnySchema,
    ArraySchema,
    BooleanSchema,
    DateSchema,
    NumberSchema,
    ObjectSchema,
    StringSchema
} from "yup";
import { enumToObjectEntries } from "../core/util/enums";
import { isPropertyBuilder } from "../core/util/entities";

// Add custom unique function for array values
declare module "yup" {
    // tslint:disable-next-line
    interface ArraySchema<T> {
        uniqueInArray(mapper: (a: T) => T, message: string): ArraySchema<T>;
    }
}
yup.addMethod(yup.array, "uniqueInArray", function(
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
    parentProperty?: ResolvedMapProperty | ResolvedArrayProperty,
}) => Promise<boolean>;

interface PropertyContext<M> {
    property: ResolvedProperty<M>,
    parentProperty?: ResolvedMapProperty<any> | ResolvedArrayProperty<any>,
    customFieldValidator?: CustomFieldValidator,
    name?: any
}

export function getYupEntitySchema<M>(properties: ResolvedProperties<M>,
                                      customFieldValidator?: CustomFieldValidator): ObjectSchema<any> {
    const objectSchema: any = {};
    Object.entries(properties as Record<string, ResolvedProperty>)
        .forEach(([name, property]) => {
            objectSchema[name] = mapPropertyToYup({
                property,
                customFieldValidator,
                name
            });
        });
    return yup.object().shape(objectSchema);
}

export function mapPropertyToYup(propertyContext: PropertyContext<any>): AnySchema<unknown> {

    const property = propertyContext.property;
    if (isPropertyBuilder(property)) {
        console.log("Error in property", propertyContext);
        throw Error("Trying to create a yup mapping from a property builder. Please use resolved properties only");
    }

    if (property.dataType === "string") {
        return getYupStringSchema(propertyContext);
    } else if (property.dataType === "number") {
        return getYupNumberSchema(propertyContext);
    } else if (property.dataType === "boolean") {
        return getYupBooleanSchema(propertyContext);
    } else if (property.dataType === "map") {
        return getYupMapObjectSchema(propertyContext);
    } else if (property.dataType === "array") {
        return getYupArraySchema(propertyContext);
    } else if (property.dataType === "date") {
        return getYupDateSchema(propertyContext);
    } else if (property.dataType === "geopoint") {
        return getYupGeoPointSchema(propertyContext);
    } else if (property.dataType === "reference") {
        return getYupReferenceSchema(propertyContext);
    }
    console.error("Unsupported data type in yup mapping", property)
    throw Error("Unsupported data type in yup mapping");
}

export function getYupMapObjectSchema({
                                                                            property,
                                                                            parentProperty,
                                                                            customFieldValidator,
                                                                            name
                                                                        }: PropertyContext<object>): ObjectSchema<any> {
    const objectSchema: any = {};
    if (property.properties)
        Object.entries(property.properties).forEach(([childName, childProperty]: [string, ResolvedProperty]) => {
            objectSchema[childName] = mapPropertyToYup({
                property: childProperty,
                parentProperty: property as ResolvedMapProperty,
                customFieldValidator,
                name: `${name}[${childName}]`
            });
        });
    return yup.object().shape(objectSchema);
}

function getYupStringSchema({
                                property,
                                parentProperty,
                                customFieldValidator,
                                name
                            }: PropertyContext<string>): StringSchema {
    let collection: StringSchema<any> = yup.string();
    const validation = property.validation;
    if (property.enumValues) {
        if (validation?.required)
            collection = collection.required(validation?.requiredMessage ? validation.requiredMessage : "Required");
        collection = collection.oneOf(
            enumToObjectEntries(property.enumValues)
                .map(([key, _]) => key)
        );
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
                        value
                    }));
        if (validation.min || validation.min === 0) collection = collection.min(validation.min, `${property.name} must be min ${validation.min} characters long`);
        if (validation.max || validation.max === 0) collection = collection.max(validation.max, `${property.name} must be max ${validation.max} characters long`);
        if (validation.matches) collection = collection.matches(validation.matches, validation.matchesMessage ? { message: validation.matchesMessage } : undefined);
        if (validation.trim) collection = collection.trim();
        if (validation.lowercase) collection = collection.lowercase();
        if (validation.uppercase) collection = collection.uppercase();
        if (property.email) collection = collection.email(`${property.name} must be an email`);
        if (property.url) collection = collection.url(`${property.name} must be a url`);
    } else {
        collection = collection.notRequired().nullable(true);
    }
    return collection;
}

function getYupNumberSchema({
                                property,
                                parentProperty,
                                customFieldValidator,
                                name
                            }: PropertyContext<number>): NumberSchema {
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
                    value
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
                                  name
                              }: PropertyContext<GeoPoint>): AnySchema {
    let collection: ObjectSchema<any> = yup.object();
    const validation = property.validation;
    if (validation?.unique && customFieldValidator && name)
        collection = collection.test("unique",
            "This value already exists and should be unique",
            (value) => customFieldValidator({
                name,
                property,
                parentProperty,
                value
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
                              name
                          }: PropertyContext<Date>): AnySchema | DateSchema {
    if (property.autoValue) {
        return yup.object().nullable(true);
    }
    let collection: DateSchema<any> = yup.date();
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
                    value
                }));
        if (validation.min) collection = collection.min(validation.min, `${property.name} must be after ${validation.min}`);
        if (validation.max) collection = collection.max(validation.max, `${property.name} must be before ${validation.min}`);
    } else {
        collection = collection.notRequired().nullable(true);
    }
    return collection;
}

function getYupReferenceSchema({
                                                                     property,
                                                                     parentProperty,
                                                                     customFieldValidator,
                                                                     name
                                                                 }: PropertyContext<EntityReference>): AnySchema {
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
                    value
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
                                 name
                             }: PropertyContext<boolean>): BooleanSchema {
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
                    value
                }));
    } else {
        collection = collection.notRequired().nullable(true);
    }
    return collection;
}

function hasUniqueInArrayModifier(property: ResolvedProperty): boolean | [string, ResolvedProperty][] {
    if (property.validation?.uniqueInArray) {
        return true;
    } else if (property.dataType === "map" && property.properties) {
        return Object.entries(property.properties)
            .filter(([key, childProperty]) => childProperty.validation?.uniqueInArray);
    }
    return false;
}

function getYupArraySchema({
                               property,
                               parentProperty,
                               customFieldValidator,
                               name
                           }: PropertyContext<any[]>): AnySchema<any> {

    let arraySchema: ArraySchema<any> = yup.array();

    if (property.of) {
        if (Array.isArray(property.of)) {
            const yupProperties = (property.of as ResolvedProperty[]).map((p, index) => ({
                [`${name}[${index}]`]: mapPropertyToYup({
                    property: p,
                    parentProperty: property
                })
            })).reduce((a, b) => ({ ...a, ...b }), {});
            return yup.array().of(
                yup.mixed().test(
                    "Dynamic object validation",
                    "Dynamic object validation error",
                    (object, context) => {
                        const yupProperty = yupProperties[context.path];
                        return yupProperty.validate(object);
                    }
                )
            );
        } else {
            arraySchema = arraySchema.of(mapPropertyToYup({
                property: property.of,
                parentProperty: property
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
