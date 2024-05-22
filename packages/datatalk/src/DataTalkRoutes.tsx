import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { CircularProgressCenter, EntityCollection } from "@firecms/core";
import { DataTalkConfig, useDataTalk } from "./DataTalkProvider";
import { DataTalkSession } from "./DataTalkSession";
import { Session } from "./types";

export function DataTalkRoutes({
                                   apiEndpoint,
                                   onAnalyticsEvent,
                                   getAuthToken,
                                   collections
                               }: {
    onAnalyticsEvent?: (event: string, params?: any) => void,
    apiEndpoint: string,
    getAuthToken: () => Promise<string>,
    collections?: EntityCollection[]
}) {

    const dataTalkConfig = useDataTalk();

    if (dataTalkConfig.loading) {
        return <CircularProgressCenter/>
    }

    return (
        <Routes>
            <Route path="/"
                   element={
                       <CreateSessionAdnRedirect dataTalkConfig={dataTalkConfig}/>
                   }/>
            <Route path="/:sessionId"
                   element={
                       <DataTalkSessionRoute dataTalkConfig={dataTalkConfig}
                                             onAnalyticsEvent={onAnalyticsEvent}
                                             apiEndpoint={apiEndpoint}
                                             getAuthToken={getAuthToken}
                                             collections={collections}/>
                   }/>
        </Routes>
    )
}

function CreateSessionAdnRedirect({ dataTalkConfig }: { dataTalkConfig: DataTalkConfig }) {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const initialPrompt = params.get("prompt");

    useEffect(() => {
        dataTalkConfig.createSessionId().then(sessionId => {
            if (initialPrompt) {
                navigate(`${location.pathname}/${sessionId}?prompt=${initialPrompt}`, { replace: true });
            } else {
                navigate(`${location.pathname}/${sessionId}`, { replace: true });
            }
        })
    }, []);

    return <CircularProgressCenter/>;
}

function DataTalkSessionRoute({
                                  dataTalkConfig,
                                  onAnalyticsEvent,
                                  apiEndpoint,
                                  getAuthToken,
                                  collections
                              }: {
    dataTalkConfig: DataTalkConfig,
    onAnalyticsEvent?: (event: string, params?: any) => void,
    apiEndpoint: string,
    getAuthToken: () => Promise<string>,
    collections?: EntityCollection[]
}) {

    const [autoRunCode, setAutoRunCode] = useState<boolean>(false);

    const { sessionId } = useParams();
    if (!sessionId) throw Error("Session id not found");

    return <DataTalkRouteInner
        key={sessionId}
        sessionId={sessionId}
        dataTalkConfig={dataTalkConfig}
        apiEndpoint={apiEndpoint}
        getAuthToken={getAuthToken}
        onAnalyticsEvent={onAnalyticsEvent}
        collections={collections}
        autoRunCode={autoRunCode}
        setAutoRunCode={setAutoRunCode}/>
}

interface DataTalkRouteInnerProps {
    sessionId: any;
    dataTalkConfig: DataTalkConfig;
    apiEndpoint: string;
    getAuthToken: () => Promise<string>;
    onAnalyticsEvent?: (event: string, params?: any) => void,
    collections?: EntityCollection[]
    autoRunCode: any;
    setAutoRunCode: any;
}

function DataTalkRouteInner({
                                sessionId,
                                dataTalkConfig,
                                apiEndpoint,
                                getAuthToken,
                                onAnalyticsEvent,
                                collections,
                                autoRunCode,
                                setAutoRunCode
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
        return <CircularProgressCenter/>
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
