import { EnumValues, PropertiesOrBuilder } from "./properties";

/**
 * Specification for defining an entity
 * @category Models
 */
export interface EntitySchema<M extends { [Key: string]: any } = any> {

    /**
     * Singular name of the entity as displayed in an Add button . E.g. Product
     */
    name: string;

    /**
     * Description of this entity
     */
    description?: string;

    /**
     * If this property is not set, the property will be created by the
     * datasource.
     * You can set the value to true to allow the users to choose the ID.
     * You can also pass a set of values (as an EnumValues object) to allow them
     * to pick from only those
     */
    customId?: boolean | EnumValues;

    /**
     * Set of properties that compose an entity
     */
    properties: PropertiesOrBuilder<M>;

    /**
     * When creating a new entity, set some values as already initialized
     */
    defaultValues?: any;

    /**
     * Array of builders for rendering additional panels in an entity view.
     * Useful if you need to render custom views
     */
    views?: EntityCustomView<M>[];

}

/**
 * New or existing status
 * @category Models
 */
export type EntityStatus = "new" | "existing" | "copy";

/**
 * Representation of an entity fetched from the datasource
 * @category Models
 */
export interface Entity<M extends { [Key: string]: any }> {

    /**
     * Id of the entity
     */
    id: string;

    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */
    path: string;

    /**
     * Current values
     */
    values: EntityValues<M>;
}

/**
 * This type represents a record of key value pairs as described in an
 * entity schema.
 * @category Models
 */
export type EntityValues<M> = M;

/**
 * Class used to create a reference to an entity in a different path
 */
export class EntityReference {
    /**
     * Id of the entity
     */
    readonly id: string;
    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */
    readonly path: string;

    constructor(id: string, path: string) {
        this.id = id;
        this.path = path;
    }
}

export class GeoPoint {

    /**
     * The latitude of this GeoPoint instance.
     */
    readonly latitude: number;
    /**
     * The longitude of this GeoPoint instance.
     */
    readonly longitude: number;

    constructor(latitude: number, longitude: number) {
        this.latitude = latitude;
        this.longitude = longitude;
    }
}

/**
 * @ignore
 */
export type InferSchemaType<S extends EntitySchema> = S extends EntitySchema<infer M> ? M : never;

/**
 * You can use this builder to render a custom panel in the entity detail view.
 * It gets rendered as a tab.
 * @category Models
 */
export type EntityCustomView<M = any> =
    {
        path: string,
        name: string,
        builder: (extraActionsParams: EntityCustomViewParams<M>) => React.ReactNode
    }

/**
 * Parameters passed to the builder in charge of rendering a custom panel for
 * an entity view.
 * @category Models
 */
export interface EntityCustomViewParams<M extends { [Key: string]: any } = any> {

    /**
     * Schema used by this entity
     */
    schema: EntitySchema<M>;

    /**
     * Entity that this view refers to. It can be undefined if the entity is new
     */
    entity?: Entity<M>;

    /**
     * Modified values in the form that have not been saved yet.
     * If the entity is not new and the values are not modified, this values
     * are the same as in `entity`
     */
    modifiedValues?: EntityValues<M>;
}

