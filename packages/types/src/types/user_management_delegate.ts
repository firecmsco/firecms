import { Role, User } from "../users";

/**
 * Result of creating a new user via admin flow.
 * Contains the created user plus information about how credentials were delivered.
 */
export interface UserCreationResult<USER extends User = User> {
    /** The created user */
    user: USER;
    /** Whether an invitation email was sent to the user */
    invitationSent: boolean;
    /** 
     * Temporary password (only present when email service is not configured).
     * This is returned one-time and should be shown to the admin to share manually.
     */
    temporaryPassword?: string;
}


/**
 * Delegate to manage users, roles, and their permissions.
 * This interface allows the CMS to be completely agnostic of the underlying
 * authentication provider or backend.
 * 
 * @group Models
 */
export interface UserManagementDelegate<USER extends User = User> {

    /**
     * Are the users and roles currently being fetched?
     */
    loading: boolean;

    /**
     * List of users managed by the CMS.
     */
    users: USER[];

    /**
     * Optional error if users failed to load.
     */
    usersError?: Error;

    /**
     * Function to get a user by its uid. This is used to show
     * user information when assigning ownership of an entity.
     * @param uid 
     */
    getUser: (uid: string) => USER | null;

    /**
     * Save a user (create or update)
     * @param user 
     */
    saveUser?: (user: USER) => Promise<USER>;

    /**
     * Create a new user with invitation/password generation support.
     * Returns additional info about how the credentials were delivered.
     * Falls back to saveUser if not provided.
     */
    createUser?: (user: USER) => Promise<UserCreationResult<USER>>;

    /**
     * Delete a user
     * @param user 
     */
    deleteUser?: (user: USER) => Promise<void>;

    /**
     * List of roles defined in the CMS.
     */
    roles?: Role[];

    /**
     * Optional error if roles failed to load.
     */
    rolesError?: Error;

    /**
     * Save a role (create or update)
     * @param role 
     */
    saveRole?: (role: Role) => Promise<void>;

    /**
     * Delete a role
     * @param role 
     */
    deleteRole?: (role: Role) => Promise<void>;

    /**
     * Is the currently logged in user an admin?
     */
    isAdmin?: boolean;

    /**
     * If true, the UI will allow the user to create the default roles (admin, editor, viewer).
     */
    allowDefaultRolesCreation?: boolean;

    /**
     * Should collection config permissions be included?
     */
    includeCollectionConfigPermissions?: boolean;



    /**
     * Optionally define roles for a given user. This is useful when the roles
     * are coming from a separate provider than the one issuing the tokens.
     */
    defineRolesFor?: (user: USER) => Promise<Role[] | undefined> | Role[] | undefined;

    /**
     * Optional function to bootstrap an admin user.
     * Often used when the database is empty.
     */
    bootstrapAdmin?: () => Promise<void>;

}
