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

    useEffect(() => {
        dataTalkConfig.createSessionId().then(sessionId => {
            navigate(`${location.pathname}/${sessionId}`);
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
    const [session, setSession] = React.useState<Session | undefined>(undefined);
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        dataTalkConfig.getSession(sessionId).then(session => {
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

    if (sessionId !== usedSession.id) {
        return <CircularProgressCenter/>;
    }

    return (
        <DataTalkSession
            key={sessionId}
            apiEndpoint={apiEndpoint}
            getAuthToken={getAuthToken}
            onAnalyticsEvent={onAnalyticsEvent}
            collections={collections}
            session={usedSession}
            autoRunCode={autoRunCode}
            setAutoRunCode={setAutoRunCode}
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
