import {
    ArrayProperty,
    BooleanProperty,
    DateProperty,
    EnumValueConfig,
    GeopointProperty,
    MapProperty,
    NumberProperty,
    ReferenceProperty,
    RelationProperty,
    StringProperty
} from "./properties";

import { EntityCollection } from "./collections";
import { Relation } from "./relations";

/**
 * This is the same entity collection you define, only all the property builders
 * are resolved to regular `Property` objects.
 * @group Models
 */
export type ResolvedEntityCollection<M extends Record<string, any> = any> =
    Omit<EntityCollection<M>, "properties">
    &
    {
        properties: ResolvedProperties,
        originalCollection?: EntityCollection<M>,
        editable?: boolean;
    }

/**
 * @group Entity properties
 */
export type ResolvedProperty =
    | ResolvedStringProperty
    | ResolvedNumberProperty
    | ResolvedBooleanProperty
    | ResolvedDateProperty
    | ResolvedGeopointProperty
    | ResolvedReferenceProperty
    | ResolvedRelationProperty
    | ResolvedArrayProperty
    | ResolvedMapProperty;

/**
 * @group Entity properties
 */
export type ResolvedProperties = {
    [k: string]: ResolvedProperty;
};

/**
 * @group Entity properties
 */
export interface ResolvedStringProperty extends StringProperty {
    resolved: true;
    fromBuilder: boolean;
    enum?: EnumValueConfig[];
}

/**
 * @group Entity properties
 */
export interface ResolvedNumberProperty extends NumberProperty {
    resolved: true;
    fromBuilder: boolean;
    enum?: EnumValueConfig[];
}

/**
 * @group Entity properties
 */
export interface ResolvedBooleanProperty extends BooleanProperty {
    resolved: true;
    fromBuilder: boolean;
}

/**
 * @group Entity properties
 */
export interface ResolvedDateProperty extends DateProperty {
    resolved: true;
    fromBuilder: boolean;
}

/**
 * @group Entity properties
 */
export interface ResolvedGeopointProperty extends GeopointProperty {
    resolved: true;
    fromBuilder: boolean;
}

/**
 * @group Entity properties
 */
export interface ResolvedReferenceProperty extends ReferenceProperty {
    resolved: true;
    fromBuilder: boolean;
}

/**
 * @group Entity properties
 */
export interface ResolvedRelationProperty extends RelationProperty {
    resolved: true;
    fromBuilder: boolean;
    relation: Relation;
}

/**
 * @group Entity properties
 */
export interface ResolvedArrayProperty extends ArrayProperty {
    resolved: true;
    fromBuilder: boolean;
    of?: ResolvedProperty;
    oneOf?: {
        properties: ResolvedProperties
        typeField?: string;
        valueField?: string;
    },
    resolvedProperties?: ResolvedProperty[];
}

/**
 * @group Entity properties
 */
export interface ResolvedMapProperty extends MapProperty {
    resolved: true;
    fromBuilder: boolean;
    properties?: ResolvedProperties;
    propertiesOrder?: string[];
}
