export const ADMIN_VIEWS_CONFIG = [
        {
            path: "users",
            name: "cms_users",
            group: "Admin",
            icon: "face"
        },
        {
            path: "roles",
            name: "roles_menu",
            group: "Admin",
            icon: "gpp_good"
        },
        {
            path: "settings",
            name: "project_settings",
            group: "Admin",
            icon: "settings"
        },
    ] satisfies {
        path: string;
        name: string;
        group: string;
        icon?: string;
    }[];
