import { User } from "./user";
import { AuthController } from "./auth";
import { EntityCollection, InferCollectionType } from "./collections";
import { Entity } from "./entities";

/**
 * Define the operations that can be performed in a collection.
 * @group Models
 */
export interface Permissions {
    /**
     * Can the user see this collection.
     * If `false` it will not show in the user's navigation
     * Defaults to `true`
     */
    read?: boolean;
    /**
     * Can the user add new entities. Defaults to `true`
     */
    create?: boolean;
    /**
     * Can the elements in this collection be edited. Defaults to `true`
     */
    edit?: boolean;
    /**
     * Can the user delete entities. Defaults to `true`
     */
    delete?: boolean;
}

/**
 * Props passed to a {@link PermissionsBuilder}
 * @group Models
 */
export interface PermissionsBuilderProps<EC extends EntityCollection = EntityCollection, USER extends User = User, M extends object = InferCollectionType<EC>> {
    /**
     * Entity being edited, might be null in some cases, when the operation
     * refers to the collection.
     * For example, when deciding whether a user can create a new entity
     * in a collection, the entity will be null.
     */
    entity: Entity<M> | null;

    /**
     * Path of the collection e.g. 'products/12345/locales'
     */
    slug: string;

    /**
     * Path segments of the collection e.g. ['products', 'locales']
     */
    pathSegments: string[];

    /**
     * Logged in user
     */
    user: USER | null;

    /**
     * Collection these permissions apply to
     */
    collection: EC;

    /**
     * Auth controller
     */
    authController: AuthController<USER>;
}

/**
 * Builder used to assign permissions to entities,
 * based on the logged user or collection.
 * @group Models
 */
export type PermissionsBuilder<EC extends EntityCollection = EntityCollection, USER extends User = User, M extends object = InferCollectionType<EC>> =
    (({
          pathSegments,
          user,
          collection,
          authController
      }: PermissionsBuilderProps<EC, USER, M>) => Permissions | undefined);
