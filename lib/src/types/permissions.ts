import { User } from "./user";
import { AuthController } from "./auth";
import { EntityCollection } from "./collections";
import { Entity } from "./entities";

/**
 * Define the operations that can be performed in a collection.
 * @category Models
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
 * @category Models
 */
export interface PermissionsBuilderProps<M extends Record<string, any> = any, UserType extends User = User> {
    /**
     * Entity being edited, might be null in some cases, when the operation
     * refers to the collection.
     * For example, when deciding whether a user can create a new entity
     * in a collection, the entity will be null.
     */
    entity: Entity<M> | null;

    /**
     * Path segments of the collection e.g. ['products', 'locales']
     */
    pathSegments: string[];

    /**
     * Logged in user
     */
    user: UserType | null;

    /**
     * Collection these permissions apply to
     */
    collection: EntityCollection<M>;

    /**
     * Auth controller
     */
    authController: AuthController<UserType>;
}

/**
 * Builder used to assign permissions to entities,
 * based on the logged user or collection.
 * @category Models
 */
export type PermissionsBuilder<M extends Record<string, any> = any, UserType extends User = User> =
    (({
          pathSegments,
          user,
          collection,
          authController
      }: PermissionsBuilderProps<M, UserType>) => Permissions);
