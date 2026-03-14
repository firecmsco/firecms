
/**
 * This interface represents a user.
 * It has some of the same fields as a Firebase User.
 * Note that in the default implementation, we simply take the Firebase user
 * and use it as a Rebase user, so that means that even if they are not mapped
 * in this interface, it contains all the methods of the former, such as `delete`,
 * `getIdToken`, etc.
 *
 * @group Models
 */
export type User = {
    /**
     * The user's unique ID, scoped to the project.
     */
    readonly uid: string;
    /**
     * The display name of the user.
     */
    readonly displayName: string | null;
    /**
     * The email of the user.
     */
    readonly email: string | null;
    /**
     * The profile photo URL of the user.
     */
    readonly photoURL: string | null;
    /**
     * The provider used to authenticate the user.
     */
    readonly providerId: string;
    /**
     *
     */
    readonly isAnonymous: boolean;

    /**
     * Role IDs assigned to this user (e.g. ["admin", "editor"]).
     * These are plain string IDs — use the UserManagementDelegate to look up full Role objects.
     */
    roles?: string[];

    getIdToken?: (forceRefresh?: boolean) => Promise<string>;

};
