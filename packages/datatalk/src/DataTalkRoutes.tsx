import React, { useCallback, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { CircularProgressCenter, EntityCollection, useNavigationController } from "@firecms/core";
import { DataTalkConfig, useDataTalk } from "./DataTalkProvider";
import { DataTalkSession } from "./DataTalkSession";
import { Session } from "./types";
import { DataTalkSessionsPanel } from "./components/DataTalkSessionsPanel";

const DEFAULT_API_ENDPOINT = "https://api.firecms.co";

export function DataTalkRoutes({
    apiEndpoint = DEFAULT_API_ENDPOINT,
    onAnalyticsEvent,
    getAuthToken,
    collections: collectionsProp,
    projectId
}: {
    onAnalyticsEvent?: (event: string, params?: any) => void,
    apiEndpoint?: string,
    getAuthToken: () => Promise<string>,
    collections?: EntityCollection[],
    projectId?: string
}) {

    const dataTalkConfig = useDataTalk();
    const navigationController = useNavigationController();

    // Use collections from prop or from navigation controller
    const collections = collectionsProp ?? navigationController.collections;

    if (dataTalkConfig.loading) {
        return <CircularProgressCenter />
    }

    return (
        <Routes>
            <Route path="/"
                element={
                    <CreateSessionAndRedirect dataTalkConfig={dataTalkConfig} />
                } />
            <Route path="/:sessionId"
                element={
                    <DataTalkSessionWithPanel
                        dataTalkConfig={dataTalkConfig}
                        onAnalyticsEvent={onAnalyticsEvent}
                        apiEndpoint={apiEndpoint}
                        getAuthToken={getAuthToken}
                        collections={collections}
                        projectId={projectId}
                    />
                } />
            {/* Catch-all for malformed paths like datatalk/* */}
            <Route path="*"
                element={
                    <CreateSessionAndRedirect dataTalkConfig={dataTalkConfig} />
                } />
        </Routes>
    )
}

function CreateSessionAndRedirect({ dataTalkConfig }: { dataTalkConfig: DataTalkConfig }) {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const initialPrompt = params.get("prompt");

    // Ensure pathname ends with slash for proper path joining
    const basePath = location.pathname.endsWith("/") ? location.pathname : location.pathname + "/";

    useEffect(() => {
        // If there's a prompt, always create a new session
        if (initialPrompt) {
            dataTalkConfig.createSessionId().then(sessionId => {
                navigate(`${basePath}${sessionId}?prompt=${initialPrompt}`, { replace: true });
            });
            return;
        }

        // Otherwise, navigate to latest session or create new one
        const latestSession = dataTalkConfig.sessions[0];
        if (latestSession) {
            navigate(`${basePath}${latestSession.id}`, { replace: true });
        } else {
            dataTalkConfig.createSessionId().then(sessionId => {
                navigate(`${basePath}${sessionId}`, { replace: true });
            });
        }
    }, []);

    return <CircularProgressCenter />;
}

function DataTalkSessionWithPanel({
    dataTalkConfig,
    onAnalyticsEvent,
    apiEndpoint,
    getAuthToken,
    collections,
    projectId
}: {
    dataTalkConfig: DataTalkConfig,
    onAnalyticsEvent?: (event: string, params?: any) => void,
    apiEndpoint?: string,
    getAuthToken: () => Promise<string>,
    collections?: EntityCollection[],
    projectId?: string
}) {

    const [autoRunCode, setAutoRunCode] = useState<boolean>(false);
    const { sessionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    if (!sessionId) throw Error("Session id not found");

    const handleNewChat = useCallback(() => {
        dataTalkConfig.createSessionId().then(newSessionId => {
            // Navigate to new session, replacing the current session ID in the URL
            const pathParts = location.pathname.split("/");
            pathParts[pathParts.length - 1] = newSessionId;
            navigate(pathParts.join("/"));
        });
    }, [dataTalkConfig, location.pathname, navigate]);

    return (
        <div className="flex h-full w-full overflow-hidden">
            <DataTalkSessionsPanel
                currentSessionId={sessionId}
                onNewChat={handleNewChat}
            />
            <div className="flex-1 h-full min-w-0 overflow-hidden">
                <DataTalkRouteInner
                    key={sessionId}
                    sessionId={sessionId}
                    dataTalkConfig={dataTalkConfig}
                    apiEndpoint={apiEndpoint}
                    getAuthToken={getAuthToken}
                    onAnalyticsEvent={onAnalyticsEvent}
                    collections={collections}
                    autoRunCode={autoRunCode}
                    setAutoRunCode={setAutoRunCode}
                    projectId={projectId}
                />
            </div>
        </div>
    );
}

interface DataTalkRouteInnerProps {
    sessionId: string;
    dataTalkConfig: DataTalkConfig;
    apiEndpoint?: string;
    getAuthToken: () => Promise<string>;
    onAnalyticsEvent?: (event: string, params?: any) => void,
    collections?: EntityCollection[]
    autoRunCode: boolean;
    setAutoRunCode: (value: boolean) => void;
    projectId?: string;
}

function DataTalkRouteInner({
    sessionId,
    dataTalkConfig,
    apiEndpoint,
    getAuthToken,
    onAnalyticsEvent,
    collections,
    autoRunCode,
    setAutoRunCode,
    projectId
}: DataTalkRouteInnerProps) {

    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const initialPrompt = params.get("prompt");

    const [session, setSession] = React.useState<Session | undefined>(undefined);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        setLoading(true);
        dataTalkConfig.getSession(sessionId)
            .then(session => {
                setSession(session);
                setLoading(false);
            });
    }, [sessionId]);

    if (loading) {
        return <CircularProgressCenter />
    }

    const usedSession = session ?? {
        id: sessionId,
        created_at: new Date(),
        messages: []
    } satisfies Session;

    return (
        <DataTalkSession
            apiEndpoint={apiEndpoint}
            getAuthToken={getAuthToken}
            onAnalyticsEvent={onAnalyticsEvent}
            collections={collections}
            session={usedSession}
            autoRunCode={autoRunCode}
            setAutoRunCode={setAutoRunCode}
            initialPrompt={initialPrompt ?? undefined}
            projectId={projectId}
            onMessagesChange={(messages) => {
                const newSession = {
                    ...usedSession,
                    messages
                };
                setSession(newSession);
                dataTalkConfig.saveSession(newSession);
            }}
        />
    )
}

