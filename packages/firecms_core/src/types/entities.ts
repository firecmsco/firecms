/**
 * New or existing status
 * @group Models
 */
export type EntityStatus = "new" | "existing" | "copy";

/**
 * Representation of an entity fetched from the datasource
 * @group Models
 */
export interface Entity<M extends object = any> {

    /**
     * ID of the entity
     */
    id: string;

    /**
     * A string representing the path of the referenced document (relative
     * to the root of the database).
     */
    path: string;

    /**
     * `path` split at its real segment boundaries, e.g. `["nodes", "node/42", "edges"]`.
     *
     * `path` is a single flattened string, so a parent entity id containing "/" cannot be
     * recovered from it. This keeps each segment whole.
     *
     * Optional, and never derived by splitting `path` — a guess would be wrong in exactly
     * the case the field exists for. Absent means "not known here", not "no slashes".
     */
    pathSegments?: string[];

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

    /**
     * `path` split at its real segment boundaries, e.g. `["nodes", "node/42", "edges"]`.
     *
     * `path` is a single flattened string, so a parent entity id containing "/" cannot be
     * recovered from it. This keeps each segment whole.
     *
     * Optional, and never derived by splitting `path` — a guess would be wrong in exactly
     * the case the field exists for. Absent means "not known here", not "no slashes".
     */
    readonly pathSegments?: string[];

    constructor(id: string, path: string, databaseId?: string, pathSegments?: string[]) {
        this.id = id;
        this.path = path;
        this.databaseId = databaseId;
        this.pathSegments = pathSegments;
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
