import { User } from "./user";
import { AuthController } from "./auth";
import { EntityCollection } from "./collections";

/**
 * Define the operations that can be performed in an entity.
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

    editCollection?: boolean;

    deleteCollection?: boolean;
}

/**
 * Props passed to a {@link PermissionsBuilder}
 * @category Models
 */
export interface PermissionsBuilderProps<M extends { [Key: string]: any }, UserType extends User = User> {

    /**
     * Path segments of the collection e.g. ['products', 'locales']
     */
    paths: string[];

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
 * Builder used to assign `create`, `edit` and `delete` permissions to entities,
 * based on the logged user, entity or collection path
 * @category Models
 */
export type PermissionsBuilder<M extends { [Key: string]: any }, UserType extends User = User> =
    (({
          paths,
          user,
          collection,
          authController
      }: PermissionsBuilderProps<M, UserType>) => Permissions);
