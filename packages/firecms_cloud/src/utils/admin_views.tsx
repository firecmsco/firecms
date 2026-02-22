export const ADMIN_VIEWS_CONFIG = [
    {
        path: "users",
        slug: "users",
        name: "CMS Users",
        group: "Admin",
        icon: "face"
    },
    {
        path: "roles",
        slug: "roles",
        name: "Roles",
        group: "Admin",
        icon: "gpp_good"
    },
    {
        path: "settings",
        slug: "settings",
        name: "Project settings",
        group: "Admin",
        icon: "settings"
    }
] satisfies {
    path: string;
    slug: string;
    name: string;
    group: string;
    icon?: string;
}[];
