/**
 * New or existing status
 * @group Models
 */
export type EntityStatus = "new" | "existing" | "copy";

/**
 * Representation of an entity fetched from the driver
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
     * Which driver this entity belongs to (e.g., 'postgres', 'firestore').
     * If not specified, the default driver is assumed.
     */
    driver?: string;

    /**
     * Which database within the driver (e.g., for Firestore multi-database).
     * If not specified, the default database of the driver is used.
     */
    databaseId?: string;
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
    /** Which driver (e.g., 'postgres', 'firestore'). Defaults to "(default)" */
    driver?: string;
    /** Which database within the driver. Defaults to "(default)" */
    databaseId?: string;
}

/**
 * Class used to create a reference to an entity in a different path.
 * 
 * @example
 * // Simple reference (most common case - single driver, single db)
 * new EntityReference({ id: "123", path: "users" })
 * 
 * // Reference to a different driver (e.g., Firestore)
 * new EntityReference({ id: "123", path: "analytics", driver: "firestore" })
 * 
 * // Reference to a specific database within a driver
 * new EntityReference({ id: "123", path: "orders", driver: "postgres", databaseId: "orders_db" })
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
     * Which driver (e.g., 'postgres', 'firestore').
     * Defaults to "(default)" if not specified.
     */
    readonly driver?: string;

    /**
     * Which database within the driver.
     * Defaults to "(default)" if not specified.
     */
    readonly databaseId?: string;

    /**
     * Create a reference to an entity.
     * 
     * @example
     * // Simple reference (most common case)
     * new EntityReference({ id: "123", path: "users" })
     * 
     * // With driver
     * new EntityReference({ id: "123", path: "analytics", driver: "firestore" })
     */
    constructor(props: EntityReferenceProps) {
        this.id = props.id;
        this.path = props.path;
        this.driver = props.driver;
        this.databaseId = props.databaseId;
    }

    get pathWithId() {
        return `${this.path}/${this.id}`;
    }

    /**
     * Get the full path including driver and database prefixes if specified.
     * For the common case (single driver, single db), this just returns pathWithId.
     */
    get fullPath() {
        const parts: string[] = [];

        // Add driver prefix if not default
        if (this.driver && this.driver !== "(default)") {
            parts.push(this.driver);
        }

        // Add database prefix if specified
        if (this.databaseId && this.databaseId !== "(default)") {
            parts.push(this.databaseId);
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

    /**
     * Pre-fetched data payload to eliminate N+1 queries.
     * When present, clients can use this directly instead of fetching.
     */
    readonly data?: Entity;

    constructor(id: string | number, path: string, data?: Entity) {
        this.id = id;
        this.path = path;
        this.data = data;
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
