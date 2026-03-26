import React, { useEffect, useState } from "react";
import {
    Avatar,
    Button,
    CircularProgress,
    Tabs,
    Tab,
    TextField,
    Typography,
    IconButton,
    DeleteIcon,
} from "@rebasepro/ui";
import { useAuthController } from "../hooks";

export function UserSettingsView() {
    const authController = useAuthController() as any;
    const user = authController.user;

    const [activeTab, setActiveTab] = useState<"profile" | "sessions">("profile");

    // Profile state
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    // Sessions state
    const [sessions, setSessions] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [sessionsError, setSessionsError] = useState<string | null>(null);
    const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
    const [revokingAll, setRevokingAll] = useState(false);

    useEffect(() => {
        setDisplayName(user?.displayName || "");
        setPhotoURL(user?.photoURL || "");
        if (activeTab === "sessions") {
            loadSessions();
        }
    }, [activeTab, user]);

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setProfileError(null);
        try {
            if (authController.updateProfile) {
                await authController.updateProfile(displayName, photoURL);
            } else {
                throw new Error("updateProfile not implemented in this auth controller.");
            }
        } catch (e: any) {
            setProfileError(e.message);
        } finally {
            setSavingProfile(false);
        }
    };

    const loadSessions = async () => {
        setLoadingSessions(true);
        setSessionsError(null);
        try {
            if (authController.fetchSessions) {
                const fetchedSessions = await authController.fetchSessions();
                const sortedSessions = (fetchedSessions || []).sort((a: any, b: any) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setSessions(sortedSessions);
            } else {
                throw new Error("fetchSessions not implemented in this auth controller.");
            }
        } catch (e: any) {
            setSessionsError(e.message);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleRevokeSession = async (id: string, isCurrentSession?: boolean) => {
        setRevokingSessionId(id);
        try {
            if (authController.revokeSession) {
                await authController.revokeSession(id);
                setSessions(sessions.filter(s => s.id !== id));
                if (isCurrentSession) {
                    await authController.signOut();
                }
            } else {
                throw new Error("revokeSession not implemented in this auth controller.");
            }
        } catch (e: any) {
            setSessionsError(e.message);
        } finally {
            setRevokingSessionId(null);
        }
    };

    const handleRevokeAll = async () => {
        setRevokingAll(true);
        try {
            if (authController.revokeAllSessions) {
                await authController.revokeAllSessions();
            } else {
                throw new Error("revokeAllSessions not implemented in this auth controller.");
            }
        } catch (e: any) {
            setSessionsError(e.message);
        } finally {
            setRevokingAll(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-12">
            <Typography variant="h4" className="mb-8">Account Settings</Typography>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-8">
                <Tab value="profile">Profile</Tab>
                <Tab value="sessions">Sessions</Tab>
            </Tabs>

            {activeTab === "profile" && (
                <div className="flex flex-col gap-6 max-w-xl">
                    <div className="flex items-center gap-6 mb-2">
                        <Avatar src={photoURL || undefined} className="w-24 h-24 text-3xl">
                            {displayName ? displayName[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "A")}
                        </Avatar>
                    </div>
                    <TextField
                        label="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <TextField
                        label="Photo URL"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                    />
                    {profileError && <Typography color="error">{profileError}</Typography>}
                    <div className="mt-4">
                        <Button variant="filled" onClick={handleSaveProfile} disabled={savingProfile}>
                            {savingProfile ? "Saving..." : "Save Profile"}
                        </Button>
                    </div>
                </div>
            )}

            {activeTab === "sessions" && (
                <div className="flex flex-col gap-4 max-w-3xl">
                    {loadingSessions ? (
                        <div className="flex justify-center p-8"><CircularProgress /></div>
                    ) : sessionsError ? (
                        <Typography color="error">{sessionsError}</Typography>
                    ) : sessions.length === 0 ? (
                        <Typography>No active sessions found.</Typography>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-end mb-2">
                                <Button
                                    variant="text"
                                    color="error"
                                    onClick={handleRevokeAll}
                                    disabled={revokingAll}
                                >
                                    {revokingAll ? "Revoking..." : "Revoke All Sessions"}
                                </Button>
                            </div>
                            {sessions.map(session => (
                                <div key={session.id} className="flex justify-between items-center p-4 bg-white dark:bg-surface-800 border rounded-lg dark:border-surface-700 shadow-sm">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Typography variant="body1">
                                                {session.userAgent || "Unknown Device"}
                                            </Typography>
                                            {session.isCurrentSession && (
                                                <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200 rounded-full">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <Typography variant="caption" color="secondary">
                                            IP: {session.ipAddress || "Unknown"} • Created: {new Date(session.createdAt).toLocaleString()}
                                        </Typography>
                                    </div>
                                    <div className="ml-4">
                                        {revokingSessionId === session.id ? (
                                            <CircularProgress size="small" />
                                        ) : (
                                            <IconButton onClick={() => handleRevokeSession(session.id, session.isCurrentSession)} aria-label="Revoke Session">
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
