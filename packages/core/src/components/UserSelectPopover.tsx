import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    cls,
    defaultBorderMixin,
    Popover,
    Typography,
    CircularProgress,
    AccountCircleIcon,
    SearchIcon,
    CloseIcon,
    IconButton,
} from "@rebasepro/ui";
import { User } from "@rebasepro/types";

/**
 * Represents a selectable user item with optional role information.
 */
export interface SelectableUser {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    roles?: string[];
}

export interface UserSelectPopoverProps {
    /**
     * The currently selected user, or `null` for "self"/default.
     */
    selectedUser: SelectableUser | null;
    /**
     * Called when the user selection changes.
     * `null` means "reset to self/default".
     */
    onUserSelected: (user: SelectableUser | null) => void;
    /**
     * Full list of users to display.
     * The component handles client-side search/filter internally.
     */
    users: SelectableUser[];
    /**
     * Whether users are currently loading.
     */
    loading?: boolean;
    /**
     * The current user (displayed as the "self" option at the top).
     */
    currentUser?: SelectableUser | null;
    /**
     * Label to display when no user is selected.
     * @default "Current user"
     */
    defaultLabel?: string;
    /**
     * Maximum number of users to render at a time (for performance).
     * Users can still be found via search.
     * @default 100
     */
    renderLimit?: number;
    /**
     * Additional class name for the trigger button.
     */
    className?: string;
    /**
     * Size variant.
     * @default "small"
     */
    size?: "small" | "medium";
}

const ITEM_HEIGHT = 44;
const MAX_VISIBLE_ITEMS = 7;

/**
 * A reusable user picker popover with search support.
 * Designed to handle very large user lists (100k+) by filtering
 * client-side and limiting the rendered set.
 *
 * @group Components
 */
export function UserSelectPopover({
    selectedUser,
    onUserSelected,
    users,
    loading = false,
    currentUser,
    defaultLabel = "Current user",
    renderLimit = 100,
    className,
    size = "small",
}: UserSelectPopoverProps) {
    const [open, setOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Effective user label for the trigger
    const effectiveUserLabel = selectedUser
        ? (selectedUser.displayName || selectedUser.email || selectedUser.uid)
        : (currentUser?.displayName || currentUser?.email || defaultLabel);

    // Filter users based on search text
    const filteredUsers = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        const base = users.filter(u => u.uid !== currentUser?.uid);

        if (!query) return base.slice(0, renderLimit);

        const matched = base.filter(u => {
            const name = (u.displayName || "").toLowerCase();
            const email = (u.email || "").toLowerCase();
            const uid = u.uid.toLowerCase();
            const roles = (u.roles || []).join(" ").toLowerCase();
            return (
                name.includes(query) ||
                email.includes(query) ||
                uid.includes(query) ||
                roles.includes(query)
            );
        });

        return matched.slice(0, renderLimit);
    }, [users, currentUser?.uid, searchText, renderLimit]);

    const totalFilterable = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        const base = users.filter(u => u.uid !== currentUser?.uid);
        if (!query) return base.length;
        return base.filter(u => {
            const name = (u.displayName || "").toLowerCase();
            const email = (u.email || "").toLowerCase();
            const uid = u.uid.toLowerCase();
            const roles = (u.roles || []).join(" ").toLowerCase();
            return name.includes(query) || email.includes(query) || uid.includes(query) || roles.includes(query);
        }).length;
    }, [users, currentUser?.uid, searchText]);

    const handleSelect = useCallback((user: SelectableUser | null) => {
        onUserSelected(user);
        setOpen(false);
        setSearchText("");
    }, [onUserSelected]);

    const handleOpenChange = useCallback((isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen) {
            // Auto-focus the search input when opening
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setSearchText("");
        }
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setOpen(false);
            setSearchText("");
        }
    }, []);

    const listHeight = Math.min(
        (filteredUsers.length + 1) * ITEM_HEIGHT, // +1 for the "self" option
        MAX_VISIBLE_ITEMS * ITEM_HEIGHT
    );

    return (
        <Popover
            open={open}
            onOpenChange={handleOpenChange}
            side="bottom"
            align="end"
            sideOffset={4}
            trigger={
                <button
                    className={cls(
                        "flex items-center gap-1.5 text-xs font-medium transition-colors rounded border border-transparent",
                        "text-text-secondary dark:text-text-secondary-dark",
                        "hover:text-text-primary dark:hover:text-text-primary-dark",
                        "bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700",
                        size === "small" ? "px-2 py-1" : "px-3 py-1.5",
                        className
                    )}
                >
                    {selectedUser?.photoURL ? (
                        <img
                            src={selectedUser.photoURL}
                            alt=""
                            className="w-4 h-4 rounded-full object-cover"
                        />
                    ) : (
                        <svg
                            className="w-3.5 h-3.5 text-text-disabled dark:text-text-disabled-dark"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    )}
                    <span className="max-w-[120px] truncate">{effectiveUserLabel}</span>
                    {selectedUser && (
                        <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                            impersonating
                        </span>
                    )}
                    <svg className="w-3 h-3 opacity-50 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            }
        >
            <div
                className="flex flex-col w-[320px] max-w-[90vw] overflow-hidden"
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                <div className={cls("px-3 py-2 border-b flex items-center justify-between shrink-0", defaultBorderMixin)}>
                    <Typography
                        variant="caption"
                        className="font-bold uppercase tracking-wider text-[9px] text-text-disabled dark:text-text-disabled-dark"
                    >
                        Run as user
                    </Typography>
                    {users.length > 0 && (
                        <Typography
                            variant="caption"
                            className="text-[9px] text-text-disabled dark:text-text-disabled-dark tabular-nums"
                        >
                            {totalFilterable} user{totalFilterable !== 1 ? "s" : ""}
                        </Typography>
                    )}
                </div>

                {/* Search input */}
                <div className={cls("px-2 py-1.5 border-b shrink-0", defaultBorderMixin)}>
                    <div className="relative">
                        <SearchIcon
                            size="smallest"
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-text-disabled dark:text-text-disabled-dark pointer-events-none"
                        />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            placeholder="Search by name, email, or role…"
                            className={cls(
                                "w-full pl-7 pr-7 py-1.5 text-xs rounded-md",
                                "bg-surface-100 dark:bg-surface-800 border",
                                defaultBorderMixin,
                                "outline-none focus:ring-1 focus:ring-primary/40",
                                "placeholder-text-disabled dark:placeholder-text-disabled-dark",
                                "text-text-primary dark:text-text-primary-dark"
                            )}
                        />
                        {searchText && (
                            <button
                                onClick={() => {
                                    setSearchText("");
                                    inputRef.current?.focus();
                                }}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700 text-text-disabled"
                            >
                                <CloseIcon size="smallest" />
                            </button>
                        )}
                    </div>
                </div>

                {/* User list */}
                <div
                    ref={listRef}
                    className="overflow-y-auto overscroll-contain"
                    style={{ maxHeight: MAX_VISIBLE_ITEMS * ITEM_HEIGHT }}
                >
                    {/* Self (default) option — always shown unless search hides it */}
                    {currentUser && (!searchText.trim() || matchesSearch(currentUser, searchText)) && (
                        <UserRow
                            user={currentUser}
                            isSelected={!selectedUser}
                            isSelf
                            onClick={() => handleSelect(null)}
                        />
                    )}

                    {/* Loading state */}
                    {loading && (
                        <div className="flex items-center justify-center py-6">
                            <CircularProgress size="small" />
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && filteredUsers.length === 0 && searchText.trim() && (
                        <div className="flex flex-col items-center justify-center py-6 px-4">
                            <Typography variant="caption" className="text-text-disabled dark:text-text-disabled-dark text-center">
                                No users matching &ldquo;{searchText}&rdquo;
                            </Typography>
                        </div>
                    )}

                    {/* User items */}
                    {!loading && filteredUsers.map(user => (
                        <UserRow
                            key={user.uid}
                            user={user}
                            isSelected={selectedUser?.uid === user.uid}
                            onClick={() => handleSelect(user)}
                        />
                    ))}

                    {/* Truncation notice */}
                    {!loading && totalFilterable > renderLimit && (
                        <div className={cls("px-3 py-2 border-t text-center", defaultBorderMixin)}>
                            <Typography
                                variant="caption"
                                className="text-[10px] text-text-disabled dark:text-text-disabled-dark"
                            >
                                Showing {renderLimit} of {totalFilterable} results. Use search to narrow down.
                            </Typography>
                        </div>
                    )}
                </div>
            </div>
        </Popover>
    );
}


// ─── Internal Components ─────────────────────────────────────────────

interface UserRowProps {
    user: SelectableUser;
    isSelected: boolean;
    isSelf?: boolean;
    onClick: () => void;
}

function UserRow({ user, isSelected, isSelf, onClick }: UserRowProps) {
    return (
        <button
            onClick={onClick}
            className={cls(
                "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                "hover:bg-surface-accent-100 dark:hover:bg-surface-accent-900",
                isSelected && "bg-primary/5 dark:bg-primary-dark/10"
            )}
            style={{ minHeight: ITEM_HEIGHT }}
        >
            {/* Avatar */}
            {user.photoURL ? (
                <img
                    src={user.photoURL}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                />
            ) : (
                <div className="w-7 h-7 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center shrink-0">
                    <AccountCircleIcon
                        size="small"
                        className="text-text-disabled dark:text-text-disabled-dark"
                    />
                </div>
            )}

            {/* User info */}
            <div className="flex flex-col min-w-0 flex-grow">
                <div className="flex items-center gap-1.5">
                    <span
                        className={cls(
                            "text-xs font-medium truncate",
                            isSelected
                                ? "text-primary dark:text-primary-dark"
                                : "text-text-primary dark:text-text-primary-dark"
                        )}
                    >
                        {user.displayName || user.email || user.uid}
                    </span>
                    {isSelf && (
                        <span className="text-[9px] text-text-disabled dark:text-text-disabled-dark font-medium shrink-0">
                            (you)
                        </span>
                    )}
                </div>
                {(user.email || user.roles?.length) && (
                    <span className="text-[10px] text-text-disabled dark:text-text-disabled-dark truncate">
                        {user.email && user.displayName ? user.email : ""}
                        {user.email && user.displayName && user.roles?.length ? " · " : ""}
                        {user.roles?.length ? user.roles.join(", ") : ""}
                    </span>
                )}
            </div>

            {/* Selection indicator */}
            {isSelected && (
                <svg
                    className="w-4 h-4 text-primary dark:text-primary-dark shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            )}
        </button>
    );
}


// ─── Helpers ─────────────────────────────────────────────────────────

function matchesSearch(user: SelectableUser, searchText: string): boolean {
    const query = searchText.trim().toLowerCase();
    if (!query) return true;
    const name = (user.displayName || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const uid = user.uid.toLowerCase();
    return name.includes(query) || email.includes(query) || uid.includes(query);
}
