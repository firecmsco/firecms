import React from "react";
import {
    BaseProperty as CoreBaseProperty,
    StringProperty as CoreStringProperty,
    NumberProperty as CoreNumberProperty,
    BooleanProperty as CoreBooleanProperty,
    DateProperty as CoreDateProperty,
    GeopointProperty as CoreGeopointProperty,
    ReferenceProperty as CoreReferenceProperty,
    RelationProperty as CoreRelationProperty,
    ArrayProperty as CoreArrayProperty,
    MapProperty as CoreMapProperty,
    PropertyBuilderProps,
    PropertyCallbacks,
    PropertyConditions
} from "../types";

export interface BaseProperty<CustomProps = any> extends CoreBaseProperty<CustomProps> {
    Field?: React.ComponentType<any>;
    Preview?: React.ComponentType<any>;
}

export type StringProperty = CoreStringProperty & BaseProperty;
export type NumberProperty = CoreNumberProperty & BaseProperty;
export type BooleanProperty = CoreBooleanProperty & BaseProperty;
export type DateProperty = CoreDateProperty & BaseProperty;
export type GeopointProperty = CoreGeopointProperty & BaseProperty;
export type ReferenceProperty = CoreReferenceProperty & BaseProperty;
export type RelationProperty = CoreRelationProperty & BaseProperty;
export type ArrayProperty = CoreArrayProperty & BaseProperty & {
    of?: any;
};
export type MapProperty = CoreMapProperty & BaseProperty & {
    properties?: any;
};

export type Property =
    | StringProperty
    | NumberProperty
    | BooleanProperty
    | DateProperty
    | GeopointProperty
    | ReferenceProperty
    | RelationProperty
    | ArrayProperty
    | MapProperty;
export type Properties<M extends Record<string, any> = Record<string, any>> = Record<string, Property>;
