import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDataTalk } from "../DataTalkProvider";
import { AddIcon, Button, cls, defaultBorderMixin, IconButton, KeyboardTabIcon, Typography } from "@firecms/ui";
import { Session } from "../types";

interface DataTalkSessionsPanelProps {
    currentSessionId?: string;
    onNewChat: () => void;
}

export function DataTalkSessionsPanel({
    currentSessionId,
    onNewChat
}: DataTalkSessionsPanelProps) {

    const [collapsed, setCollapsed] = useState(false);
    const { sessions, loading } = useDataTalk();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSessionClick = (session: Session) => {
        // Navigate to session, replacing current URL with new session ID
        const pathParts = location.pathname.split("/");
        pathParts[pathParts.length - 1] = session.id;
        navigate(pathParts.join("/"));
    };

    return (
        <div
            className={cls(
                "h-full flex flex-col border-r bg-surface-50 dark:bg-surface-900",
                "transition-all duration-300 ease-in-out",
                "hidden md:flex",
                collapsed ? "w-12 min-w-12 cursor-pointer" : "w-64 min-w-64",
                defaultBorderMixin
            )}
            onClick={collapsed ? () => setCollapsed(false) : undefined}
        >
            {/* Header with New Chat button and collapse */}
            <div className={cls(
                "p-3 border-b flex items-center gap-2 transition-all duration-300",
                collapsed && "justify-center p-2",
                defaultBorderMixin
            )}>
                {!collapsed && (
                    <Button
                        size="small"
                        className="flex-1"
                        onClick={onNewChat}
                    >
                        <AddIcon size="small" />
                        <span className="ml-2">New Chat</span>
                    </Button>
                )}
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        setCollapsed(!collapsed);
                    }}
                >
                    <KeyboardTabIcon
                        size="small"
                        className={cls(
                            "transition-transform duration-300",
                            collapsed ? "" : "rotate-180"
                        )}
                    />
                </IconButton>
            </div>

            {/* Sessions list - only show when expanded */}
            <div className={cls(
                "flex-1 overflow-auto transition-opacity duration-300",
                collapsed ? "opacity-0 overflow-hidden" : "opacity-100"
            )}>
                {!collapsed && (
                    <>
                        {loading ? (
                            <div className="p-4 text-center">
                                <Typography variant="caption" color="secondary">Loading...</Typography>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="p-4 text-center">
                                <Typography variant="caption" color="secondary">No conversations yet</Typography>
                            </div>
                        ) : (
                            <div className="py-2">
                                {sessions.map((session) => {
                                    const isActive = session.id === currentSessionId;
                                    const firstMessage = session.messages[0];
                                    const preview = firstMessage?.text.slice(0, 40) || "New conversation";
                                    const hasMore = (firstMessage?.text.length ?? 0) > 40;

                                    return (
                                        <button
                                            key={session.id}
                                            onClick={() => handleSessionClick(session)}
                                            className={cls(
                                                "w-full text-left px-3 py-2 cursor-pointer transition-colors",
                                                "hover:bg-surface-100 dark:hover:bg-surface-800",
                                                isActive && "bg-surface-100/50 dark:bg-surface-800/50"
                                            )}
                                        >
                                            <Typography
                                                variant="body2"
                                                className="truncate font-medium"
                                            >
                                                {preview}{hasMore && "..."}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="secondary"
                                                className="truncate"
                                            >
                                                {session.created_at.toLocaleDateString()}
                                            </Typography>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
