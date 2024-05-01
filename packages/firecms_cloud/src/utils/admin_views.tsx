export const ADMIN_VIEWS_CONFIG = [
        {
            path: "users",
            name: "CMS Users",
            group: "Admin",
            icon: "face"
        },
        {
            path: "roles",
            name: "Roles",
            group: "Admin",
            icon: "gpp_good"
        },
        {
            path: "settings",
            name: "Project settings",
            group: "Admin",
            icon: "settings"
        }
    ] satisfies {
        path: string;
        name: string;
        group: string;
        icon?: string;
    }[];
