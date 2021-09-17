import { User } from "./user";

/**
 * Implement this function to allow access to specific users
 * @category Models
 */
export type Authenticator = ({ user }: {
    user?: User
}) => boolean | Promise<boolean>;
