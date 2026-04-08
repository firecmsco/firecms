import { User } from "@rebasepro/types";
import { Chip, Tooltip } from "@rebasepro/ui";

export function UserChip({ user }: { user: User }) {
    return (
        <Tooltip title={user.email ?? user.uid}>
            <Chip size={"small"} className={"flex items-center"}>
                {user.photoURL && <img
                    className={"rounded-full w-6 h-6 mr-2"}
                    src={user.photoURL} alt={user.displayName ?? "User picture"} />}
                <span>{user.displayName ?? user.email ?? user.uid}</span>
            </Chip>
        </Tooltip>
    );
}
