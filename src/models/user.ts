import { AuthController } from "./auth";
import { Locale } from "./locales";
import { DataSource } from "./datasource";
import { StorageSource } from "./storage";

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
     * Additional metadata around user creation and sign-in times.
     */
    readonly metadata: any;

} & any; // we allow for any other property so Users can be extended to user needs


/**
 * Implement this function to allow access to specific users.
 * You might want to load additional properties for a user asynchronously
 * and store it using the `setExtra` method in the `authController`
 * @category Models
 */
export type Authenticator<UserType extends User = User> = ({ user }: {
    /**
     * Logged in user or null
     */
    user: UserType | null;

    /**
     * AuthController
     */
    authController: AuthController<UserType>;

    /**
     * Format of the dates in the CMS.
     * Defaults to 'MMMM dd, yyyy, HH:mm:ss'
     */
    dateTimeFormat?: string;

    /**
     * Locale of the CMS, currently only affecting dates
     */
    locale?: Locale;

    /**
     * Connector to your database, e.g. your Firestore database
     */
    dataSource: DataSource;

    /**
     * Used storage implementation
     */
    storageSource: StorageSource;
}) => boolean | Promise<boolean>;
