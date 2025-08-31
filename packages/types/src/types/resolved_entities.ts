import {
    ArrayProperty,
    BooleanProperty,
    CMSType,
    DateProperty,
    EnumValueConfig,
    GeopointProperty,
    MapProperty,
    NumberProperty,
    ReferenceProperty,
    RelationProperty,
    StringProperty
} from "./properties";
import { EntityReference, EntityRelation, GeoPoint } from "./entities";
import { EntityCollection } from "./collections";

/**
 * This is the same entity collection you define, only all the property builders
 * are resolved to regular `Property` objects.
 * @group Models
 */
export type ResolvedEntityCollection<M extends Record<string, any> = any> =
    Omit<EntityCollection<M>, "properties">
    &
    {
        properties: ResolvedProperties<M>,
        originalCollection?: EntityCollection<M>,
        editable?: boolean;
    }

/**
 * @group Entity properties
 */
export type ResolvedProperty<T extends CMSType = CMSType> =
    T extends string ? ResolvedStringProperty :
        T extends number ? ResolvedNumberProperty :
            T extends boolean ? ResolvedBooleanProperty :
                T extends Date ? ResolvedTimestampProperty :
                    T extends GeoPoint ? ResolvedGeopointProperty :
                        T extends EntityReference ? ResolvedReferenceProperty :
                            T extends EntityRelation | EntityRelation[] ? ResolvedRelationProperty :
                                T extends CMSType[] ? ResolvedArrayProperty<T> :
                                    T extends Record<string, any> ? ResolvedMapProperty<T> : any;

/**
 * @group Entity properties
 */
export type ResolvedProperties<M extends Record<string, any> = any> = {
    [k in keyof M]: ResolvedProperty<M[k]>;
};

/**
 * @group Entity properties
 */
export type ResolvedStringProperty =
    Omit<StringProperty, "enum" | "type"> &
    {
        type: "string";
        resolved: true;
        enum?: EnumValueConfig[];
        fromBuilder: boolean;
    }

/**
 * @group Entity properties
 */
export type ResolvedNumberProperty =
    Omit<NumberProperty, "enum" | "type"> &
    {
        type: "number";
        resolved: true;
        enum?: EnumValueConfig[];
        fromBuilder: boolean;
    }

/**
 * @group Entity properties
 */
export type ResolvedBooleanProperty =
    Omit<BooleanProperty, "type"> &
    {
        type: "boolean";
        resolved: true;
        fromBuilder: boolean;
    }

/**
 * @group Entity properties
 */
export type ResolvedTimestampProperty =
    Omit<DateProperty, "type"> &
    {
        type: "date";
        resolved: true;
        fromBuilder: boolean;
    }

/**
 * @group Entity properties
 */
export type ResolvedGeopointProperty =
    Omit<GeopointProperty, "type"> &
    {
        type: "geopoint";
        resolved: true;
        fromBuilder: boolean;
    }

/**
 * @group Entity properties
 */
export type ResolvedReferenceProperty =
    Omit<ReferenceProperty, "type"> &
    {
        type: "reference";
        resolved: true;
        fromBuilder: boolean;
    }
/**
 * @group Entity properties
 */
export type ResolvedRelationProperty =
    Omit<RelationProperty, "type"> &
    {
        type: "relation";
        resolved: true;
        fromBuilder: boolean;
    }

/**
 * @group Entity properties
 */
export type ResolvedArrayProperty<T extends ArrayT[] = any[], ArrayT extends CMSType = any>
    =
    Omit<ArrayProperty<T, ArrayT>, "of" | "oneOf" | "type"> &
    {
        type: "array";
        resolved: true;
        of?: ResolvedProperty<any> | ResolvedProperty<any>[],
        oneOf?: {
            properties: ResolvedProperties
            typeField?: string;
            valueField?: string;
        },
        resolvedProperties: ResolvedProperty<any>[];
        fromBuilder: boolean;
    }

/**
 * @group Entity properties
 */
export type ResolvedMapProperty<T extends Record<string, any> = any> =
    Omit<MapProperty, "properties" | "type" | "propertiesOrder"> &
    {
        type: "map";
        resolved: true;
        properties?: ResolvedProperties<T>;
        propertiesOrder?: Extract<keyof T, string>[];
        fromBuilder: boolean;
    }

