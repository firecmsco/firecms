/**
 * New or existing status
 * @group Models
 */
export type EntityStatus = "new" | "existing" | "copy";

/**
 * Representation of an entity fetched from the datasource
 * @group Models
 */
export interface Entity<M extends object = object> {

    /**
     * ID of the entity
     */
    id: string | number;

    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */
    path: string;

    /**
     * Current values
     */
    values: EntityValues<M>;

    /**
     * Which datasource this entity belongs to (e.g., 'postgres', 'firestore').
     * If not specified, the default datasource is assumed.
     */
    datasource?: string;

    /**
     * Which database within the datasource (e.g., for Firestore multi-database).
     * If not specified, the default database of the datasource is used.
     */
    database?: string;
}

/**
 * This type represents a record of key value pairs as described in an
 * entity collection.
 * @group Models
 */
export type EntityValues<M extends object> = M;

/**
 * Props for creating an EntityReference
 */
export interface EntityReferenceProps {
    /** ID of the entity */
    id: string;
    /** Path of the collection (relative to the root of the database) */
    path: string;
    /** Which datasource (e.g., 'postgres', 'firestore'). Defaults to "(default)" */
    datasource?: string;
    /** Which database within the datasource. Defaults to "(default)" */
    database?: string;
}

/**
 * Class used to create a reference to an entity in a different path.
 * 
 * @example
 * // Simple reference (most common case - single datasource, single db)
 * new EntityReference({ id: "123", path: "users" })
 * 
 * // Reference to a different datasource (e.g., Firestore)
 * new EntityReference({ id: "123", path: "analytics", datasource: "firestore" })
 * 
 * // Reference to a specific database within a datasource
 * new EntityReference({ id: "123", path: "orders", datasource: "postgres", database: "orders_db" })
 */
export class EntityReference {

    readonly __type = "reference";
    /**
     * ID of the entity
     */
    readonly id: string;
    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */
    readonly path: string;

    /**
     * Which datasource (e.g., 'postgres', 'firestore').
     * Defaults to "(default)" if not specified.
     */
    readonly datasource?: string;

    /**
     * Which database within the datasource.
     * Defaults to "(default)" if not specified.
     */
    readonly database?: string;

    /**
     * Create a reference to an entity.
     * 
     * @example
     * // Simple reference (most common case)
     * new EntityReference({ id: "123", path: "users" })
     * 
     * // With datasource
     * new EntityReference({ id: "123", path: "analytics", datasource: "firestore" })
     */
    constructor(props: EntityReferenceProps) {
        this.id = props.id;
        this.path = props.path;
        this.datasource = props.datasource;
        this.database = props.database;
    }

    get pathWithId() {
        return `${this.path}/${this.id}`;
    }

    /**
     * Get the full path including datasource and database prefixes if specified.
     * For the common case (single datasource, single db), this just returns pathWithId.
     */
    get fullPath() {
        const parts: string[] = [];

        // Add datasource prefix if not default
        if (this.datasource && this.datasource !== "(default)") {
            parts.push(this.datasource);
        }

        // Add database prefix if specified
        if (this.database && this.database !== "(default)") {
            parts.push(this.database);
        }

        if (parts.length > 0) {
            return `${parts.join(":")}:::${this.path}/${this.id}`;
        }
        return this.pathWithId;
    }

    isEntityReference() {
        return true;
    }
}

/**
 * Class used to create a reference to an entity in a different path
 */
export class EntityRelation {

    readonly __type = "relation";
    /**
     * ID of the entity
     */
    readonly id: string | number;
    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */
    readonly path: string;

    constructor(id: string | number, path: string) {
        this.id = id;
        this.path = path;
    }

    get pathWithId() {
        return `${this.path}/${this.id}`;
    }

    isEntityReference() {
        return false;
    }

    isEntityRelation() {
        return true;
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

export class Vector {
    readonly value: number[];

    constructor(value: number[]) {
        this.value = value;
    }
}
