import { User } from "../types";
import { AccountCircleIcon, cls, defaultBorderMixin } from "@firecms/ui";

/**
 * Component to render a single user with name and email
 */
export function UserDisplay({
                                user,
                            }: { user: User | null }) {
    if (!user) {
        return <span className="text-text-secondary dark:text-text-secondary-dark">Select a user</span>;
    }

    const avatarSizeClass = "w-6 h-6";

    return (
        <div className={cls(
            "inline-flex items-center gap-4 px-2 py-1 rounded-xl",
            "bg-surface-accent-100 dark:bg-surface-accent-800",
            "border",
            defaultBorderMixin
        )}>
            {user.photoURL ? (
                <img
                    src={user.photoURL}
                    alt={user.displayName || user.email || "User"}
                    className={cls(
                        "rounded-full object-cover",
                        avatarSizeClass
                    )}
                />
            ) : (
                <AccountCircleIcon
                    className={cls(
                        "text-text-secondary dark:text-text-secondary-dark",
                        avatarSizeClass
                    )}
                />
            )}
            <div className="flex flex-col min-w-0">
                <span className={cls("font-regular truncate", "text-sm")}>
                    {user.displayName || user.email || "-"}
                </span>
                {user.displayName && user.email && (
                    <span className={cls("text-text-secondary dark:text-text-secondary-dark truncate",
                        "text-xs"
                    )}>
                        {user.email}
                    </span>
                )}
            </div>
        </div>
    );
}
