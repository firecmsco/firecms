import { User } from "./user";

/**
 * Implement this function to allow access to specific users
 * @category Authentication
 */
export type Authenticator = ({ user }: {
    user?: User
}) => boolean | Promise<boolean>;
