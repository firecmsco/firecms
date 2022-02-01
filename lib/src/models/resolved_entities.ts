import {
    ArrayProperty,
    BooleanProperty,
    CMSType, EnumValueConfig,
    EnumValues,
    GeopointProperty,
    MapProperty,
    NumberProperty,
    ReferenceProperty,
    StringProperty,
    TimestampProperty
} from "./properties";
import {
    EntityReference,
    EntitySchema,
    EntityValues,
    GeoPoint
} from "./entities";


/**
 * @category Models
 */
export type EntitySchemaResolverProps<M = any> = {
    entityId?: string | undefined,
    values?: Partial<EntityValues<M>>,
    previousValues?: Partial<EntityValues<M>>,
};

/**
 * Use to resolve the schema properties for specific path, entity id or values.
 *
 * @category Models
 */
export type EntitySchemaResolver<M = any> = ({
                                                 entityId,
                                                 values,
                                                 previousValues
                                             }: EntitySchemaResolverProps<M>) => ResolvedEntitySchema<M>;

/**
 * This is the same entity schema you define, only all the property builders
 * are resolved to regular `Property` objects.
 * @category Models
 */
export type ResolvedEntitySchema<M> =
    Omit<EntitySchema<M>, "properties"> &
    {
        properties: ResolvedProperties<M>,
        originalSchema: EntitySchema<M>
    }

/**
 * @category Entity properties
 */
export type ResolvedProperty<T extends CMSType = CMSType> =
    T extends string ? ResolvedStringProperty :
        T extends number ? ResolvedNumberProperty :
            T extends boolean ? ResolvedBooleanProperty :
                T extends Date ? ResolvedTimestampProperty :
                    T extends GeoPoint ? ResolvedGeopointProperty :
                        T extends EntityReference ? ResolvedReferenceProperty :
                            T extends Array<CMSType> ? ResolvedArrayProperty<T> :
                                T extends { [Key: string]: any } ? ResolvedMapProperty<T> : never;

export type ResolvedProperties<M extends { [Key: string]: any } = any> = {
    [k in keyof M]: ResolvedProperty<M[keyof M]>;
};

export type ResolvedStringProperty =
    Omit<StringProperty, "enumValues" | "dataType"> &
    {
        dataType: "string";
        enumValues: EnumValueConfig[],
    }

export type ResolvedNumberProperty =
    Omit<NumberProperty, "enumValues" | "dataType"> &
    {
        dataType: "number";
        enumValues: EnumValueConfig[],
    }
export type ResolvedBooleanProperty =
    Omit<BooleanProperty, "dataType"> &
    {
        dataType: "boolean",
    }
export type ResolvedTimestampProperty =
    Omit<TimestampProperty, "dataType"> &
    {
        dataType: "timestamp",
    }
export type ResolvedGeopointProperty =
    Omit<GeopointProperty, "dataType"> &
    {
        dataType: "geopoint",
    }
export type ResolvedReferenceProperty =
    Omit<ReferenceProperty, "dataType"> &
    {
        dataType: "reference",
    }

export type ResolvedArrayProperty<T extends ArrayT[] = any[], ArrayT extends CMSType = any> =
    Omit<ArrayProperty, "of" | "oneOf" | "dataType"> &
    {
        dataType: "array";
        of?: ResolvedProperty<ArrayT>,
        oneOf?: {
            properties: Record<string, ResolvedProperty>
            typeField?: string;
            valueField?: string;
        }
    }

export type ResolvedMapProperty<T extends { [Key: string]: any } = any> =
    Omit<MapProperty, "properties" | "dataType"> &
    {
        dataType: "map";
        properties?: ResolvedProperties<Partial<T>>
    }
