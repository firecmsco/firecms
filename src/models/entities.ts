import { EnumValues, Properties, PropertiesOrBuilder } from "./properties";
import { User } from "./user";
import { FireCMSContext } from "./firecms_context";
import { FilterCombination, FilterValues } from "./collections";

/**
 * Specification for defining an entity
 * @category Models
 */
export interface EntitySchema<M extends { [Key: string]: any } = any,
    AdditionalKey extends string = string,
    UserType = User> {

    id: string;

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
     * Initial filters applied to this collection.
     * Defaults to none.
     */
    initialFilter?: FilterValues<Extract<keyof M, string>>; // setting FilterValues<M> can break defining schemas by code

    /**
     * Default sort applied to this collection
     */
    initialSort?: [Extract<keyof M, string>, "asc" | "desc"];

    /**
     * Set of properties that compose an entity
     */
    properties: PropertiesOrBuilder<M>;

    /**
     * Order in which the properties are displayed.
     * If you are specifying your schema as code, the order is the same as the
     * one you define in `properties`
     */
    propertiesOrder?: (keyof M)[];

    /**
     * When creating a new entity, set some values as already initialized
     */
    defaultValues?: any;

    /**
     * Array of builders for rendering additional panels in an entity view.
     * Useful if you need to render custom views
     */
    views?: EntityCustomView<M>[];

    /**
     * You can add additional columns to the collection view by implementing
     * an additional column delegate.
     */
    additionalColumns?: AdditionalColumnDelegate<M, AdditionalKey, UserType>[];

    /**
     * Default size of the rendered collection
     */
    defaultSize?: CollectionSize;

    /**
     * Can the elements in this collection be edited inline in the collection
     * view. If this flag is set to false but `permissions.edit` is `true`, entities
     * can still be edited in the side panel
     */
    inlineEditing?: boolean;

    /**
     * If you need to filter/sort by multiple properties in this
     * collection, you can define the supported filter combinations here.
     * In the case of Firestore, you need to create special indexes in the console to
     * support filtering/sorting by more than one property. You can then
     * specify here the indexes created.
     */
    filterCombinations?: FilterCombination<Extract<keyof M, string>>[];

}

/**
 * Sizes in which a collection can be rendered
 * @category Models
 */
export type CollectionSize = "xs" | "s" | "m" | "l" | "xl";

/**
 * Use this interface for adding additional columns to entity collection views.
 * If you need to do some async loading you can use AsyncPreviewComponent
 * @category Models
 */
export interface AdditionalColumnDelegate<M extends { [Key: string]: any } = any,
    AdditionalKey extends string = string,
    UserType = User> {

    /**
     * Id of this column. You can use this id in the `properties` field of the
     * collection in any order you want
     */
    id: AdditionalKey;

    /**
     * Header of this column
     */
    title: string;

    /**
     * Width of the generated column in pixels
     */
    width?: number;

    hideFromCollection?: boolean;

    /**
     * Builder for the content of the cell for this column
     */
    builder: ({ entity, context }: {
        entity: Entity<M>,
        context: FireCMSContext<UserType>;
    }) => React.ReactNode;

    /**
     * If this column needs to update dynamically based on other properties,
     * you can define an array of keys as strings with the
     * `dependencies` prop.
     * e.g. ["name", "surname"]
     * If you don't specify this prop, the generated column will not rerender
     * on entity property updates.
     */
    dependencies?: Extract<keyof M, string>[];
}

/**
 * @category Models
 */
export type EntitySchemaResolverProps<M = any> = {
    entityId?: string | undefined,
    values?: Partial<EntityValues<M>>,
};

/**
 * Use to resolve the schema properties for specific path, entity id or values.
 *
 * @category Models
 */
export type EntitySchemaResolver<M = any> = ({
                                                 entityId,
                                                 values
                                             }: EntitySchemaResolverProps<M>) => ResolvedEntitySchema<M>;

/**
 * This is the same entity schema you define, only all the property builders
 * are resolved to regular `Property` objects.
 * @category Models
 */
export type ResolvedEntitySchema<M> =
    Omit<EntitySchema<M>, "properties"> &
    {
        properties: Properties<M>,
        originalSchema: EntitySchema<M>
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

    get pathWithId() {
        return `${this.path}/${this.id}`;
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
    schema: ResolvedEntitySchema<M>;

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

