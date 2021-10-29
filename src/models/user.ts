import { AuthController } from "./auth";

/**
 * This interface represents a user.
 * It has the some of the same fields as a Firebase User.
 * Note that in the default implementation, we simply take the Firebase user
 * and use it as a FireCMS user, so that means that even if they are not mapped
 * in this interface, it contains all the methods of the former, such as `delete`,
 * `getIdToken`, etc.
 *
 * @category Models
 */
export type User = {
    /**
     * The display name of the user.
     */
    readonly displayName: string | null;
    /**
     * The email of the user.
     */
    readonly email: string | null;
    /**
     * The phone number normalized based on the E.164 standard (e.g. +16505550101) for the
     * user.
     *
     * @remarks
     * This is null if the user has no phone credential linked to the account.
     */
    readonly phoneNumber: string | null;
    /**
     * The profile photo URL of the user.
     */
    readonly photoURL: string | null;
    /**
     * The provider used to authenticate the user.
     */
    readonly providerId: string;
    /**
     * The user's unique ID, scoped to the project.
     */
    readonly uid: string;
    /**
     *
     */
    readonly isAnonymous: boolean;
    /**
     * Additional metadata around user creation and sign-in times.
     */
    readonly metadata: any;
    /**
     * Additional per provider such as displayName and profile information.
     */
    readonly providerData: any;

} & any; // we allow for any other property so Users can be extended to user needs


/**
 * Implement this function to allow access to specific users.
 * You might want to load additional properties for a user asynchronously
 * and store it using the `setExtra` method in the `authController`
 * @category Models
 */
export type Authenticator = ({ user }: {
    user?: User,
    authController: AuthController;
}) => boolean | Promise<boolean>;
