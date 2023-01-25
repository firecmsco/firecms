import {
    AdditionalFieldDelegate,
    ArrayProperty,
    BooleanProperty,
    CMSType,
    DateProperty,
    EntityCallbacks,
    EntityCollection,
    EnumValueConfig,
    EnumValues,
    FieldConfig,
    GeopointProperty,
    MapProperty,
    NumberProperty,
    PropertiesOrBuilders,
    PropertyBuilder,
    PropertyOrBuilder,
    ReferenceProperty,
    StringProperty,
    User
} from "../types";

/**
 * Identity function we use to defeat the type system of Typescript and build
 * collection views with all its properties
 * @param collection
 * @category Builder
 */
export function buildCollection<M extends Record<string, any> = any,
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
export function buildProperty<T extends CMSType = CMSType, P extends PropertyOrBuilder<T> = PropertyOrBuilder<T>, M extends Record<string, any> = Record<string, any>>(
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
                                    P extends PropertyBuilder<T, M> ? PropertyBuilder<T, M> : never {
    return property as any;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param properties
 * @category Builder
 */
export function buildProperties<M extends Record<string, any>>(
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
export function buildPropertiesOrBuilder<M extends Record<string, any>>(
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
export function buildEntityCallbacks<M extends Record<string, any> = any>(
    callbacks: EntityCallbacks<M>
): EntityCallbacks<M> {
    return callbacks;
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * additional field delegates views with all its properties
 * @param additionalFieldDelegate
 * @category Builder
 */
export function buildAdditionalFieldDelegate<M extends Record<string, any>, AdditionalKey extends string = string, UserType extends User = User>(
    additionalFieldDelegate: AdditionalFieldDelegate<M, AdditionalKey, UserType>
): AdditionalFieldDelegate<M, AdditionalKey, UserType> {
    return additionalFieldDelegate;
}

/**
 * Identity function we use to defeat the type system of Typescript and build
 * additional field delegates views with all its properties
 * @param fieldConfig
 * @category Builder
 */
export function buildFieldConfig<T extends CMSType = CMSType>(
    fieldConfig: FieldConfig<T>
): FieldConfig<T> {
    return fieldConfig;
}
