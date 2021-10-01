import {
    ArrayProperty,
    BooleanProperty,
    CMSType,
    EntityValues,
    GeopointProperty,
    MapProperty,
    NumberProperty,
    PropertiesOrBuilder,
    Property,
    PropertyOrBuilder,
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
import { enumToObjectEntries } from "../core/util/enums";
import { buildPropertyFrom } from "../core/util/property_builder";

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
    property: Property,
    parentProperty?: MapProperty | ArrayProperty
}) => Promise<boolean>;

interface PropertyContext<PT extends Property> {
    property: PT,
    parentProperty?: MapProperty | ArrayProperty,
    customFieldValidator?: CustomFieldValidator,
    name?: any
}

export function mapPropertyToYup(propertyContext: PropertyContext<any>): AnySchema<unknown> {

    const property = propertyContext.property;
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
    } else if (property.dataType === "timestamp") {
        return getYupDateSchema(propertyContext);
    } else if (property.dataType === "geopoint") {
        return getYupGeoPointSchema(propertyContext);
    } else if (property.dataType === "reference") {
        return getYupReferenceSchema(propertyContext);
    }
    throw Error("Unsupported data type in yup mapping: " + property);
}

export function getYupEntitySchema<T extends CMSType, M extends { [Key: string]: any }>
(properties: PropertiesOrBuilder<M>,
 values: Partial<EntityValues<M>>,
 path: string,
 customFieldValidator?: CustomFieldValidator,
 entityId?: string): ObjectSchema<any> {
    const objectSchema: any = {};
    Object.entries(properties).forEach(([name, propertyOrBuilder]) => {
        objectSchema[name] = mapPropertyToYup({
            property: buildPropertyFrom(propertyOrBuilder as PropertyOrBuilder<any, M>, values, path, entityId),
            customFieldValidator,
            name
        });
    });
    return yup.object().shape(objectSchema);
}

export function getYupMapObjectSchema<M extends { [Key: string]: any }>({
                                                                            property,
                                                                            parentProperty,
                                                                            customFieldValidator,
                                                                            name
                                                                        }: PropertyContext<MapProperty>): ObjectSchema<any> {
    const objectSchema: any = {};
    if (property.properties)
        Object.entries(property.properties).forEach(([childName, childProperty]: [string, Property]) => {
            objectSchema[childName] = mapPropertyToYup({
                property: childProperty,
                parentProperty: property,
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
                            }: PropertyContext<StringProperty>): StringSchema {
    let schema: StringSchema<any> = yup.string();
    const validation = property.validation;
    if (property.config?.enumValues) {
        if (validation?.required)
            schema = schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required");
        schema = schema.oneOf(
            enumToObjectEntries(property.config?.enumValues)
                .map(([key, _]) => key)
        );
    }
    if (validation) {
        schema = validation.required ?
            schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
        if (validation.unique && customFieldValidator && name)
            schema = schema.test("unique", `This value already exists and should be unique`,
                (value, context) =>
                    customFieldValidator({
                        name,
                        property,
                        parentProperty,
                        value
                    }));
        if (validation.min || validation.min === 0) schema = schema.min(validation.min, `${property.title} must be min ${validation.min} characters long`);
        if (validation.max || validation.max === 0) schema = schema.max(validation.max, `${property.title} must be max ${validation.max} characters long`);
        if (validation.matches) schema = schema.matches(validation.matches);
        if (validation.email) schema = schema.email(`${property.title} must be an email`);
        if (validation.url) schema = schema.url(`${property.title} must be a url`);
        if (validation.trim) schema = schema.trim();
        if (validation.lowercase) schema = schema.lowercase();
        if (validation.uppercase) schema = schema.uppercase();
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}

function getYupNumberSchema({
                                property,
                                parentProperty,
                                customFieldValidator,
                                name
                            }: PropertyContext<NumberProperty>): NumberSchema {
    const validation = property.validation;
    let schema: NumberSchema<any> = yup.number().typeError("Must be a number");
    if (validation) {
        schema = validation.required ?
            schema.required(validation.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
        if (validation.unique && customFieldValidator && name)
            schema = schema.test("unique",
                `This value already exists and should be unique`,
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value
                }));
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

function getYupGeoPointSchema({
                                  property,
                                  parentProperty,
                                  customFieldValidator,
                                  name
                              }: PropertyContext<GeopointProperty>): AnySchema {
    let schema: ObjectSchema<any> = yup.object();
    const validation = property.validation;
    if (validation?.unique && customFieldValidator && name)
        schema = schema.test("unique",
            `This value already exists and should be unique`,
            (value) => customFieldValidator({
                name,
                property,
                parentProperty,
                value
            }));
    if (validation?.required) {
        schema = schema.required(validation.requiredMessage).nullable(true);
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}

function getYupDateSchema({
                              property,
                              parentProperty,
                              customFieldValidator,
                              name
                          }: PropertyContext<TimestampProperty>): AnySchema | DateSchema {
    if (property.autoValue) {
        return yup.object().nullable(true);
    }
    let schema: DateSchema<any> = yup.date();
    const validation = property.validation;
    if (validation) {
        schema = validation.required ?
            schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
        if (validation.unique && customFieldValidator && name)
            schema = schema.test("unique",
                `This value already exists and should be unique`,
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value
                }));
        if (validation.min) schema = schema.min(validation.min, `${property.title} must be after ${validation.min}`);
        if (validation.max) schema = schema.max(validation.max, `${property.title} must be before ${validation.min}`);
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}

function getYupReferenceSchema<M extends { [Key: string]: any }>({
                                                                     property,
                                                                     parentProperty,
                                                                     customFieldValidator,
                                                                     name
                                                                 }: PropertyContext<ReferenceProperty>): AnySchema {
    let schema: ObjectSchema<any> = yup.object();
    const validation = property.validation;
    if (validation) {
        schema = validation.required ?
            schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
        if (validation.unique && customFieldValidator && name)
            schema = schema.test("unique",
                `This value already exists and should be unique`,
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value
                }));
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}

function getYupBooleanSchema({
                                 property,
                                 parentProperty,
                                 customFieldValidator,
                                 name
                             }: PropertyContext<BooleanProperty>): BooleanSchema {
    let schema: BooleanSchema<any> = yup.boolean();
    const validation = property.validation;
    if (validation) {
        schema = validation.required ?
            schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
        if (validation.unique && customFieldValidator && name)
            schema = schema.test("unique",
                `This value already exists and should be unique`,
                (value) => customFieldValidator({
                    name,
                    property,
                    parentProperty,
                    value
                }));
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}

function hasUniqueInArrayModifier(property: Property): boolean | [string, Property][] {
    if (property.validation?.uniqueInArray) {
        return true;
    } else if (property.dataType === "map" && property.properties) {
        return Object.entries(property.properties)
            .filter(([key, childProperty]) => childProperty.validation?.uniqueInArray);
    }
    return false;
}

function getYupArraySchema<T>({
                                  property,
                                  parentProperty,
                                  customFieldValidator,
                                  name
                              }: PropertyContext<ArrayProperty>): ArraySchema<any> {

    let schema: ArraySchema<any> = yup.array();

    if (property.of) {
        schema = schema.of(mapPropertyToYup({
            property: property.of,
            parentProperty: property
        }));
        const arrayUniqueFields = hasUniqueInArrayModifier(property.of);
        if (arrayUniqueFields) {
            if (typeof arrayUniqueFields === "boolean") {
                schema = schema.uniqueInArray(v => v, `${property.title} should have unique values within the array`);
            } else if (Array.isArray(arrayUniqueFields)) {
                arrayUniqueFields.forEach(([name, childProperty]) =>
                    schema = schema.uniqueInArray(v => v && v[name], `${property.title} → ${childProperty.title ?? name}: should have unique values within the array`)
                );
            }
        }
    }
    const validation = property.validation;

    if (validation) {
        schema = validation.required ?
            schema.required(validation?.requiredMessage ? validation.requiredMessage : "Required").nullable(true) :
            schema.notRequired().nullable(true);
        if (validation.min || validation.min === 0) schema = schema.min(validation.min, `${property.title} should be min ${validation.min} entries long`);
        if (validation.max) schema = schema.max(validation.max, `${property.title} should be max ${validation.max} entries long`);
    } else {
        schema = schema.notRequired().nullable(true);
    }
    return schema;
}
