import {
    CMSType,
    EnumValueConfig,
    EnumValues,
    Properties,
    PropertiesOrBuilder,
    Property,
    PropertyOrBuilder
} from "./properties";
import {
    EntitySchema,
    EntityValues,
    Navigation,
    NavigationBuilder
} from "../models";
import { AdditionalColumnDelegate, EntityCollection } from "./collections";

/**
 * Identity function we use to defeat the type system of Typescript and build
 * properties
 * @category Builder
 */
export function buildPropertyFrom<T extends CMSType, S extends EntitySchema<Key>, Key extends string>(
    propertyOrBuilder: PropertyOrBuilder<T, S, Key>,
    values: Partial<EntityValues<S, Key>>,
    entityId?: string
): Property<T> {
    if (typeof propertyOrBuilder === "function") {
        return propertyOrBuilder({ values, entityId });
    } else {
        return propertyOrBuilder;
    }
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * navigation objects with all its properties
 * @param navigation
 * @category Builder
 */
export function buildNavigation(
    navigation: Navigation | NavigationBuilder
): Navigation | NavigationBuilder {
    return navigation;
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * collection views with all its properties
 * @param collectionView
 * @category Builder
 */
export function buildCollection<S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>,
    AdditionalKey extends string = string>(
    collectionView: EntityCollection<S, Key, AdditionalKey>
): EntityCollection<S, Key, AdditionalKey> {
    return collectionView;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the schema keys
 * @param schema
 * @category Builder
 */
export function buildSchema<Key extends string = string>(
    schema: EntitySchema<Key>
): EntitySchema<Key> {
    return schema;
}

/**
 * Identity function that requires a builds a schema based on a type.
 * Useful if you have defined your models in Typescript.
 * The schema property keys are validated by the type system but the property
 * data types are not yet, so you could still match a string type to a
 * NumberProperty, e.g.
 * @param schema
 * @category Builder
 */
export function buildSchemaFrom<Type extends Partial<{ [P in Key]: T; }>,
    Key extends string = Extract<keyof Type, string>,
    T extends CMSType = CMSType>(
    schema: EntitySchema<Key>
): EntitySchema<Key> {
    return schema;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the property keys.
 * @param property
 * @category Builder
 */
export function buildProperty<T extends CMSType>(
    property: Property<T>
): Property<T> {
    return property;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param properties
 * @category Builder
 */
export function buildProperties<Key extends string>(
    properties: Properties<Key>
): Properties<Key> {
    return properties;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param propertiesOrBuilder
 * @category Builder
 */
export function buildPropertiesOrBuilder<T extends CMSType, S extends EntitySchema<Key>, Key extends string>(
    propertiesOrBuilder: PropertiesOrBuilder<S, Key>
): PropertiesOrBuilder<S, Key> {
    return propertiesOrBuilder;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param enumValues
 * @category Builder
 */
export function buildEnumValues(
    enumValues: EnumValues
): EnumValues {
    return enumValues;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param enumValueConfig
 * @category Builder
 */
export function buildEnumValueConfig(
    enumValueConfig: EnumValueConfig
): EnumValueConfig {
    return enumValueConfig;
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * additional column delegates views with all its properties
 * @param additionalColumnDelegate
 * @category Builder
 */
export function buildAdditionalColumnDelegate<AdditionalKey extends string = string,
    S extends EntitySchema<Key> = EntitySchema<any>,
    Key extends string = Extract<keyof S["properties"], string>>(
    additionalColumnDelegate: AdditionalColumnDelegate<AdditionalKey, S, Key>
): AdditionalColumnDelegate<AdditionalKey, S, Key> {
    return additionalColumnDelegate;
}
