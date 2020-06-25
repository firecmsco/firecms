import { User } from "firebase/app";


/**
 * Implement this function to allow access to specific users
 */
export type Authenticator = (user?: User) => boolean | Promise<boolean>;
