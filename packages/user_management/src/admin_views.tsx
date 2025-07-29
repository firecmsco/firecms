import { CMSView } from "@firecms/core";
import { RolesView, UsersView } from "./components";

export const userManagementAdminViews: CMSView[] = [
    {
        slug: "users",
        name: "CMS Users",
        group: "Admin",
        icon: "face",
        view: <UsersView/>
    },
    {
        slug: "roles",
        name: "Roles",
        group: "Admin",
        icon: "gpp_good",
        view: <RolesView/>
    }
]
