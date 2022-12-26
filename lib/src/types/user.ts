/**
 * This interface represents a user.
 * It has some of the same fields as a Firebase User.
 * Note that in the default implementation, we simply take the Firebase user
 * and use it as a FireCMS user, so that means that even if they are not mapped
 * in this interface, it contains all the methods of the former, such as `delete`,
 * `getIdToken`, etc.
 *
 * @category Models
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

};
