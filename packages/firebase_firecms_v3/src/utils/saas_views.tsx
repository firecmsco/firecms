import { CMSView } from "firecms";
import { ProjectSettings } from "../components/settings/ProjectSettings";
import { UsersView } from "../components/users/UsersView";
import { RolesView } from "../components/roles/RolesView";

export const ADMIN_VIEWS: CMSView[] = ([
    {
        path: "users",
        name: "CMS Users",
        group: "Admin",
        icon: "face",
        hideFromNavigation: true,
        view: <UsersView/>
    },
    {
        path: "roles",
        name: "Roles",
        group: "Admin",
        icon: "gpp_good",
        hideFromNavigation: true,
        view: <RolesView/>
    },
    {
        path: "settings",
        name: "Project settings",
        group: "Admin",
        icon: "settings",
        hideFromNavigation: true,
        view: <ProjectSettings/>
    }
]);
