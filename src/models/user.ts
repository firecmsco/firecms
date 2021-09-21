/**
 * This interface represents a user.
 * It has the some of the same fields as a Firebase User
 *
 * @category Models
 */
export interface User {
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

    /**
     * Additional data you can use to store any information relevant to you,
     * such as roles.
     */
    extra: any;
}
