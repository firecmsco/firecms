import { User } from "./user";
import { Entity } from "./entities";
import { AuthController } from "./auth";
import { FireCMSContext } from "./firecms_context";


/**
 * Define the operations that can be performed in an entity.
 * @category Models
 */
export interface Permissions {
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
export interface PermissionsBuilderProps<M extends { [Key: string]: any }, UserType = User> {
    /**
     * Entity being edited, might be null if it is new
     */
    entity: Entity<M> | null;
    /**
     * Collection path of this entity
     */
    path: string;
    /**
     * Logged in user
     */
    user: UserType | null;
    /**
     * Auth controller
     */
    authController: AuthController<UserType>;
    /**
     * Context of the app status
     */
    context: FireCMSContext<UserType>;
}

/**
 * Builder used to assign `create`, `edit` and `delete` permissions to entities,
 * based on the logged user, entity or collection path
 * @category Models
 */
export type PermissionsBuilder<M extends { [Key: string]: any }, UserType = User> =
    Permissions
    | (({
            entity,
            path,
            user,
            authController,
            context
        }: PermissionsBuilderProps<M, UserType>) => Permissions);


