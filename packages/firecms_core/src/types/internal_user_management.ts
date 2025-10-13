import { User } from "./user";

export type InternalUserManagement<USER extends User = User> = {

    /**
     * List of users to be managed by the CMS.
     */
    users: USER[];

    /**
     * Function to get a user by its uid. This is used to show
     * user information when assigning ownership of an entity.
     *
     * You can pass your own implementation if you want to show
     * more information about the user.
     *
     * If you are using the FireCMS user management plugin, this
     * function will be implemented automatically.
     *
     * @param uid
     */
    getUser: (uid: string) => USER | null;

}
