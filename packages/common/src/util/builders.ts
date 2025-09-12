import {
    AdditionalFieldDelegate,
    ArrayProperty,
    BooleanProperty,
    DateProperty,
    EntityCallbacks,
    EntityCollection,
    EnumValueConfig,
    EnumValues,
    GeopointProperty,
    MapProperty,
    NumberProperty, Properties,
    Property,
    PropertyConfig,
    ReferenceProperty,
    StringProperty,
    User
} from "@firecms/types";

/**
 * Identity function we use to defeat the type system of Typescript and build
 * collection views with all its properties
 * @param collection
 * @group Builder
 */
export function buildCollection<
    M extends Record<string, any> = any,
    USER extends User = User>
(
    collection: EntityCollection<M, USER>
): EntityCollection<M, USER> {
    return collection;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the property keys.
 * @param property
 * @group Builder
 */
export function buildProperty<T, P extends Property = Property>(
    property: P
):
    P extends StringProperty ? StringProperty :
        P extends NumberProperty ? NumberProperty :
            P extends BooleanProperty ? BooleanProperty :
                P extends DateProperty ? DateProperty :
                    P extends GeopointProperty ? GeopointProperty :
                        P extends ReferenceProperty ? ReferenceProperty :
                            P extends ArrayProperty ? ArrayProperty :
                                P extends MapProperty ? MapProperty : never {
    return property as any;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param properties
 * @group Builder
 */
export function buildProperties<M extends Record<string, any>>(
    properties: Properties
): Properties {
    return properties;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param propertiesOrBuilder
 * @group Builder
 */
export function buildPropertiesOrBuilder<M extends Record<string, any>>(
    propertiesOrBuilder: Properties
): Properties {
    return propertiesOrBuilder;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param enumValues
 * @group Builder
 */
export function buildEnum(
    enumValues: EnumValues
): EnumValues {
    return enumValues;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param enumValueConfig
 * @group Builder
 */
export function buildEnumValueConfig(
    enumValueConfig: EnumValueConfig
): EnumValueConfig {
    return enumValueConfig;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param callbacks
 * @group Builder
 */
export function buildEntityCallbacks<M extends Record<string, any> = any>(
    callbacks: EntityCallbacks<M>
): EntityCallbacks<M> {
    return callbacks;
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * additional field delegates views with all its properties
 * @param additionalFieldDelegate
 * @group Builder
 */
export function buildAdditionalFieldDelegate<M extends Record<string, any>, USER extends User = User>(
    additionalFieldDelegate: AdditionalFieldDelegate<M, USER>
): AdditionalFieldDelegate<M, USER> {
    return additionalFieldDelegate;
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * additional field delegates views with all its properties
 * @param propertyConfig
 * @group Builder
 */
export function buildFieldConfig(
    propertyConfig: PropertyConfig
): PropertyConfig{
    return propertyConfig;
}
