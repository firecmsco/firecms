import { CMSView } from "@firecms/core";
import { RolesView, UsersView } from "./components";
export const userManagementAdminViews: CMSView[] = [
    {
        path: "users",
        name: "cms_users",
        group: "Admin",
        icon: "face",
        view: <UsersView/>
    },
    {
        path: "roles",
        name: "roles_menu",
        group: "Admin",
        icon: "gpp_good",
        view: <RolesView/>
    }
]
