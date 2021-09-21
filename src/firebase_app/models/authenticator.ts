import { User } from "../../models";

/**
 * Implement this function to allow access to specific users
 * @category Firebase
 */
export type Authenticator = ({ user }: {
    user?: User
}) => boolean | Promise<boolean>;
