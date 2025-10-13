import { User } from "../types";
import { AccountCircleIcon, cls } from "@firecms/ui";

/**
 * Component to render a single user with name and email
 */
export function UserDisplay({
                                user,
                                size = "medium"
                            }: { user: User | null; size?: "small" | "medium" | "large" }) {
    if (!user) {
        return <span className="text-text-secondary dark:text-text-secondary-dark">Select a user</span>;
    }

    const sizeClasses = {
        small: "text-xs",
        medium: "text-sm",
        large: "text-sm"
    };

    const avatarSizeClass = size === "small" ? "w-4 h-4" : size === "large" ? "w-6 h-6" : "w-4 h-4";

    return (
        <div className="flex items-center gap-4">
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
                <span className={cls("font-semibold truncate", sizeClasses[size])}>
                    {user.displayName || user.email || "Unknown User"}
                </span>
                {user.displayName && user.email && (
                    <span className={cls("text-text-secondary dark:text-text-secondary-dark truncate",
                        size === "small" ? "text-[10px]" : size === "large" ? "text-xs" : "text-[11px]"
                    )}>
                        {user.email}
                    </span>
                )}
            </div>
        </div>
    );
}
