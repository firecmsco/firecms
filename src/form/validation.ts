import {
    ArrayProperty,
    BooleanProperty,
    EntitySchema,
    EntityValues,
    GeopointProperty,
    NumberProperty,
    Properties,
    Property,
    ReferenceProperty,
    StringProperty,
    TimestampProperty
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
import { PropertiesOrBuilder, PropertyOrBuilder } from "../models/models";
import { buildProperty } from "../models/builders";


export function mapPropertyToYup(property: Property): AnySchema<unknown> {
    if (property.dataType === "string") {
        return getYupStringSchema(property);
    } else if (property.dataType === "number") {
        return getYupNumberSchema(property);
    } else if (property.dataType === "boolean") {
        return getYupBooleanSchema(property);
    } else if (property.dataType === "map") {
        return getYupMapObjectSchema(property.properties);
    } else if (property.dataType === "array") {
        return getYupArraySchema(property);
    } else if (property.dataType === "timestamp") {
        return getYupDateSchema(property);
    } else if (property.dataType === "geopoint") {
        return getYupGeoPointSchema(property);
    } else if (property.dataType === "reference") {
        return getYupReferenceSchema(property);
    }
    throw Error("Unsupported data type in yup mapping: " + property);
}

export function getYupEntitySchema<S extends EntitySchema<Key>, Key extends string>
(properties: PropertiesOrBuilder<S, Key>,
 values: Partial<EntityValues<S, Key>>,
 entityId?: string): ObjectSchema<any> {
    const objectSchema: any = {};
    Object.entries(properties).forEach(([key, propertyOrBuilder]) => {
        objectSchema[key] = mapPropertyToYup(buildProperty(propertyOrBuilder as PropertyOrBuilder<S, Key>, values, entityId));
    });
    return yup.object().shape(objectSchema);
}

export function getYupMapObjectSchema<S extends EntitySchema<Key>, Key extends string>(properties: Properties<any>): ObjectSchema<any> {
    const objectSchema: any = {};
    Object.entries(properties).forEach(([key, property]: [string, Property]) => {
        objectSchema[key] = mapPropertyToYup(property);
    });
    return yup.object().shape(objectSchema);
}

function getYupStringSchema(property: StringProperty): StringSchema {
    let schema: StringSchema<any> = yup.string();
    const validation = property.validation;
    if (property.config?.enumValues) {
        if (validation?.required)
            schema = schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required");
        schema = schema.oneOf(Object.keys(property.config?.enumValues));
    }
    if (validation) {
        schema = validation.required ?
            schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
        if (validation.min || validation.min === 0) schema = schema.min(validation.min, `${property.title} must be min ${validation.min} characters long`);
        if (validation.max) schema = schema.max(validation.max, `${property.title} must be max ${validation.min} characters long`);
        if (validation.matches) schema = schema.matches(validation.matches);
        if (validation.email) schema = schema.email(`${property.title} must be an email`);
        if (validation.url) schema = schema.url(`${property.title} must be a url`);
        if (validation.trim) schema = schema.trim();
        if (validation.lowercase) schema = schema.lowercase();
        if (validation.lowercase) schema = schema.uppercase();
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}

function getYupNumberSchema(property: NumberProperty): NumberSchema {
    const validation = property.validation;
    let schema: NumberSchema<any> = yup.number().typeError("Must be a number");
    if (validation) {
        schema = validation.required ?
            schema.required(validation.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
        if (validation.min || validation.min === 0) schema = schema.min(validation.min, `${property.title} must be higher or equal to ${validation.min}`);
        if (validation.max || validation.max === 0) schema = schema.max(validation.max, `${property.title} must be lower or equal to ${validation.max}`);
        if (validation.lessThan || validation.lessThan === 0) schema = schema.lessThan(validation.lessThan, `${property.title} must be higher than ${validation.lessThan}`);
        if (validation.moreThan || validation.moreThan === 0) schema = schema.moreThan(validation.moreThan, `${property.title} must be lower than ${validation.moreThan}`);
        if (validation.positive) schema = schema.positive(`${property.title} must be positive`);
        if (validation.negative) schema = schema.negative(`${property.title} must be negative`);
        if (validation.integer) schema = schema.integer(`${property.title} must be an integer`);
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}

function getYupGeoPointSchema(property: GeopointProperty): AnySchema {
    let schema: ObjectSchema<any> = yup.object();
    const validation = property.validation;
    if (validation?.required) {
        schema = schema.required(validation.requiredMessage).nullable(true);
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}

function getYupDateSchema(property: TimestampProperty): AnySchema | DateSchema {
    if (property.autoValue) {
        return yup.object().nullable(true);
    }
    let schema: DateSchema<any> = yup.date();
    const validation = property.validation;
    if (validation) {
        schema = validation.required ?
            schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
        if (validation.min) schema = schema.min(validation.min, `${property.title} must be after ${validation.min}`);
        if (validation.max) schema = schema.max(validation.max, `${property.title} must be before ${validation.min}`);
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}

function getYupReferenceSchema<S extends EntitySchema>(property: ReferenceProperty<S>): AnySchema {
    let schema: ObjectSchema<any> = yup.object();
    const validation = property.validation;
    if (validation) {
        schema = validation.required ?
            schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}

function getYupBooleanSchema(property: BooleanProperty): BooleanSchema {
    let schema: BooleanSchema<any> = yup.boolean();
    const validation = property.validation;
    if (validation) {
        schema = validation.required ?
            schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}

function getYupArraySchema<T>(property: ArrayProperty<T>): ArraySchema<any> {

    let schema: ArraySchema<any> = yup.array().of(mapPropertyToYup(property.of));
    const validation = property.validation;

    if (validation) {
        schema = validation.required ?
            schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
        if (validation.min || validation.min === 0) schema = schema.min(validation.min, `${property.title} should be min ${validation.min} entries long`);
        if (validation.max) schema = schema.max(validation.max, `${property.title} should be max ${validation.min} entries long`);
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}
