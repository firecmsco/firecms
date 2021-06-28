import firebase from "firebase/app";

/**
 * Implement this function to allow access to specific users
 * @category Authentication
 */
export type Authenticator = (user?: firebase.User) => boolean | Promise<boolean>;
