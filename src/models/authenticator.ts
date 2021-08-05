import firebase from "firebase/app";
import "firebase/auth";

/**
 * Implement this function to allow access to specific users
 * @category Authentication
 */
export type Authenticator = (user?: firebase.User) => boolean | Promise<boolean>;
