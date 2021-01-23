import firebase from 'firebase/app';

/**
 * Implement this function to allow access to specific users
 */
export type Authenticator = (user?: firebase.User) => boolean | Promise<boolean>;
