import {
    AdditionalColumnDelegate,
    ArrayProperty,
    BooleanProperty,
    CMSType, EntityCallbacks,
    EntityCollection,
    EntitySchema,
    EntityValues,
    EnumValueConfig,
    EnumValues,
    GeopointProperty,
    MapProperty,
    Navigation,
    NavigationBuilder,
    NumberProperty,
    Properties,
    PropertiesOrBuilder,
    Property,
    PropertyBuilder,
    PropertyOrBuilder,
    ReferenceProperty,
    StringProperty,
    TimestampProperty
} from "../models";


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
export function buildCollection<M extends { [Key: string]: any },
    AdditionalKey extends string = string>(
    collectionView: EntityCollection<M, AdditionalKey>
): EntityCollection<M, AdditionalKey> {
    return collectionView;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the schema keys
 * @param schema
 * @category Builder
 */
export function buildSchema<M extends { [Key: string]: any }>(
    schema: EntitySchema<M>
): EntitySchema<M> {
    return schema;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the property keys.
 * @param property
 * @category Builder
 */
export function buildProperty<T extends CMSType, P extends PropertyOrBuilder<T, any> = PropertyOrBuilder<T, any>>(
    property: P
): P extends StringProperty ? StringProperty :
    P extends NumberProperty ? NumberProperty :
        P extends BooleanProperty ? BooleanProperty :
            P extends TimestampProperty ? TimestampProperty :
                P extends GeopointProperty ? GeopointProperty :
                    P extends ReferenceProperty ? ReferenceProperty :
                        P extends ArrayProperty ? ArrayProperty :
                            P extends MapProperty ? MapProperty :
                                P extends PropertyBuilder<T, any> ? PropertyBuilder<T, any> : any {
    return property as any;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param properties
 * @category Builder
 */
export function buildProperties<M>(
    properties: Properties<M>
): Properties<M> {
    return properties;
}

/**
 * Identity function we use to defeat the type system of Typescript and preserve
 * the properties keys.
 * @param propertiesOrBuilder
 * @category Builder
 */
export function buildPropertiesOrBuilder<M>(
    propertiesOrBuilder: PropertiesOrBuilder<M>
): PropertiesOrBuilder<M> {
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
export function buildEntityCallbacks<M>(
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
export function buildAdditionalColumnDelegate<M extends { [Key: string]: any }, AdditionalKey extends string = string>(
    additionalColumnDelegate: AdditionalColumnDelegate<M, AdditionalKey>
): AdditionalColumnDelegate<M, AdditionalKey> {
    return additionalColumnDelegate;
}
