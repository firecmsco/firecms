import {
    ArrayProperty,
    BooleanProperty,
    EntitySchema,
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
    ArraySchema,
    BooleanSchema,
    DateSchema,
    NumberSchema,
    ObjectSchema,
    Schema,
    StringSchema
} from "yup";


function mapPropertyToYup(property: Property): Schema<any> {
    if (property.dataType === "string") {
        return getYupStringSchema(property);
    } else if (property.dataType === "number") {
        return getYupNumberSchema(property);
    } else if (property.dataType === "boolean") {
        return getYupBooleanSchema(property);
    } else if (property.dataType === "map") {
        return getYupObjectSchema(property.properties);
    } else if (property.dataType === "array") {
        return getYupArraySchema(property);
    } else if (property.dataType === "timestamp") {
        return getYupDateSchema(property);
    } else if (property.dataType === "geopoint") {
        return getYupGeoPointSchema(property);
    } else if (property.dataType === "reference") {
        return getYupReferenceSchema(property);
    }
    throw Error("Unsupported data type in yup mapping");
}

export function getYupObjectSchema(properties: Properties): ObjectSchema<any> {
    const objectSchema: any = {};
    Object.entries(properties).forEach(([key, property]: [string, Property]) => {
        // TODO:temporarily disabling reference validation
        if (property.dataType !== "reference")
            objectSchema[key] = mapPropertyToYup(property);
    });
    return yup.object().shape(objectSchema);
}

function getYupStringSchema(property: StringProperty): StringSchema {
    let schema = yup.string();
    const validation = property.validation;
    if (validation) {
        if (validation.required) {
            schema = schema.required("Required").nullable(false); // todo: required message?
        }
    }
    if (property.enumValues) {
        schema = schema.oneOf(Object.keys(property.enumValues));
    }
    return schema;
}

function getYupNumberSchema(property: NumberProperty): NumberSchema {
    let schema = yup.number();
    const validation = property.validation;
    if (validation) {
        if (validation.required) {
            schema = schema.required("Required").nullable(false); // todo: required message?
        }
    }
    return schema;
}

function getYupGeoPointSchema(property: GeopointProperty): ObjectSchema {
    let schema = yup.object();
    const validation = property.validation;
    if (validation) {
        if (validation.required) {
            schema = schema.required("Required").nullable(false); // todo: required message?
        }
    }
    return schema;
}

function getYupDateSchema(property: TimestampProperty): DateSchema {
    let schema = yup.date();
    const validation = property.validation;
    if (validation) {
        if (validation.required) {
            schema = schema.required("Required").nullable(false); // todo: required message?
        }
    }
    return schema;
}

function getYupReferenceSchema<S extends EntitySchema>(property: ReferenceProperty<S>): StringSchema {
    let schema = yup.string();
    const validation = property.validation;
    if (validation) {
        if (validation.required) {
            schema = schema.required("Required").nullable(false); // todo: required message?
        }
    }
    return schema;
}

function getYupBooleanSchema(property: BooleanProperty): BooleanSchema {
    let schema = yup.boolean();
    const validation = property.validation;
    if (validation) {
        if (validation.required) {
            schema = schema.required("Required").nullable(false); // todo: required message?
        }
    }
    return schema;
}

function getYupArraySchema<T>(property: ArrayProperty<T>): ArraySchema<T> {
    let schema: ArraySchema<T> = yup.array().of(mapPropertyToYup(property.of));
    const validation = property.validation;
    if (validation) {
        if (validation.required) {
            schema = schema.required("Required").nullable(false); // todo: required message?
        }
    }
    return schema;
}
