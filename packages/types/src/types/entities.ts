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

    databaseId?: string;
}

/**
 * This type represents a record of key value pairs as described in an
 * entity collection.
 * @group Models
 */
export type EntityValues<M extends object> = M;

/**
 * Class used to create a reference to an entity in a different path
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
     * Optional database ID where the entity is stored (if multiple databases are used)
     */
    readonly databaseId?: string;

    constructor(id: string, path: string, databaseId?: string) {
        this.id = id;
        this.path = path;
        this.databaseId = databaseId;
    }

    get pathWithId() {
        return `${this.path}/${this.id}`;
    }

    get pathWithIdAndDatabase() {
        if (this.databaseId) {
            if (this.databaseId === "(default)") {
                return this.pathWithId;
            }
            return `${this.databaseId}:::${this.path}/${this.id}`;
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
