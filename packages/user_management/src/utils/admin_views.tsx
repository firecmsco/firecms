import React from "react";

import { CMSView } from "@firecms/core";
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
    }
]);
