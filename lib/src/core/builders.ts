import {
    AdditionalColumnDelegate,
    ArrayProperty,
    BooleanProperty,
    CMSType,
    DateProperty,
    EntityCallbacks,
    EntityCollection,
    EnumValueConfig,
    EnumValues,
    GeopointProperty,
    MapProperty,
    NumberProperty,
    PropertiesOrBuilders,
    PropertyBuilder,
    PropertyOrBuilder,
    ReferenceProperty,
    StringProperty,
    User
} from "../models";

/**
 * Identity function we use to defeat the type system of Typescript and build
 * collection views with all its properties
 * @param collection
 * @category Builder
 */
export function buildCollection<M extends object = object,
    AdditionalKey extends string = string,
    UserType extends User = User>(
    collection: EntityCollection<M, AdditionalKey, UserType>
): EntityCollection<M, AdditionalKey, UserType> {
    return collection;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the property keys.
 * @param property
 * @category Builder
 */
export function buildProperty<T extends any = CMSType, P extends PropertyOrBuilder<T> = PropertyOrBuilder<T>>(
    property: P
):
    P extends StringProperty ? StringProperty :
        P extends NumberProperty ? NumberProperty :
            P extends BooleanProperty ? BooleanProperty :
                P extends DateProperty ? DateProperty :
                    P extends GeopointProperty ? GeopointProperty :
                        P extends ReferenceProperty ? ReferenceProperty :
                            P extends ArrayProperty ? ArrayProperty :
                                P extends MapProperty ? MapProperty :
                                    P extends PropertyBuilder<T> ? PropertyBuilder<T> : never {
    return property as any;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param properties
 * @category Builder
 */
export function buildProperties<M extends object = object>(
    properties: PropertiesOrBuilders<M>
): PropertiesOrBuilders<M> {
    return properties;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param propertiesOrBuilder
 * @category Builder
 */
export function buildPropertiesOrBuilder<M extends object = object>(
    propertiesOrBuilder: PropertiesOrBuilders<M>
): PropertiesOrBuilders<M> {
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
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param callbacks
 * @category Builder
 */
export function buildEntityCallbacks<M extends object= any>(
    callbacks: EntityCallbacks<M>
): EntityCallbacks<M> {
    return callbacks;
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * additional column delegates views with all its properties
 * @param additionalColumnDelegate
 * @category Builder
 */
export function buildAdditionalColumnDelegate<M extends object = object, AdditionalKey extends string = string, UserType extends User = User>(
    additionalColumnDelegate: AdditionalColumnDelegate<M, AdditionalKey, UserType>
): AdditionalColumnDelegate<M, AdditionalKey, UserType> {
    return additionalColumnDelegate;
}
