import React, { useCallback, useContext, useEffect, useState } from "react";
import {
    collection,
    doc,
    getFirestore,
    limit,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    Timestamp
} from "@firebase/firestore";
import { FirebaseApp } from "@firebase/app";
import { Session } from "./types";
import { getDataTalkSamplePrompts } from "./api";

export type DataTalkConfig = {
    loading: boolean;
    sessions: Session[];
    createSessionId: () => Promise<string>;
    saveSession: (session: Session) => Promise<void>;
    getSession: (sessionId: string) => Promise<Session | undefined>;
    rootPromptsSuggestions?: string[];
};

interface DataTalkConfigParams {
    enabled: boolean;
    firebaseApp?: FirebaseApp;
    userSessionsPath?: string;
    getAuthToken: () => Promise<string>;
    apiEndpoint: string;
}

const DataTalkConfigContext = React.createContext<DataTalkConfig>({} as any);

export function useBuildDataTalkConfig({
                                           enabled,
                                           firebaseApp,
                                           userSessionsPath,
                                           getAuthToken,
                                           apiEndpoint
                                       }: DataTalkConfigParams): DataTalkConfig {

    const [loading, setLoading] = useState<boolean>(true);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [samplePrompts, setSamplePrompts] = useState<string[]>([]);

    useEffect(() => {
        if (!enabled) return;
        getAuthToken().then((firebaseToken) => {
            getDataTalkSamplePrompts(firebaseToken, apiEndpoint).then(setSamplePrompts);
        });
    }, []);

    const createSessionId = useCallback(async (): Promise<string> => {
        if (!firebaseApp) throw Error("useBuildDataTalkConfig Firebase not initialised");
        const firestore = getFirestore(firebaseApp);
        if (!firestore || !userSessionsPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        return doc(collection(firestore, userSessionsPath)).id;
    }, [firebaseApp, userSessionsPath]);

    const saveSession = useCallback(async (session: Session) => {
        if (!firebaseApp) throw Error("useBuildDataTalkConfig Firebase not initialised");
        const firestore = getFirestore(firebaseApp);
        if (!firestore || !userSessionsPath) throw Error("useFirestoreConfigurationPersistence Firestore not initialised");
        const {
            id,
            ...sessionData
        } = session;
        const sessionDoc = doc(firestore, userSessionsPath, id);
        return setDoc(sessionDoc, sessionData);
    }, [firebaseApp, userSessionsPath]);

    const getSession = useCallback(async (sessionId: string) => {
        return sessions.find(s => s.id === sessionId);
    }, [sessions])

    useEffect(() => {
        if (!enabled) return;
        if (!firebaseApp) throw Error("useBuildDataTalkConfig Firebase not initialised");
        const firestore = getFirestore(firebaseApp);
        if (!firestore || !userSessionsPath) return;

        return onSnapshot(
            query(
                collection(firestore, userSessionsPath).withConverter(timestampToDateConverter),
                orderBy("created_at", "desc"),
                limit(50)
            ),
            {
                next: (snapshot) => {
                    const updatedSessions = snapshot.docs.map(doc => {
                        return {
                            id: doc.id,
                            ...doc.data()
                        } as Session;
                    });
                    setSessions(updatedSessions);
                    setLoading(false);
                },
                error: (e) => {
                    console.error(e);
                }
            }
        );
    }, [firebaseApp, userSessionsPath]);

    return {
        loading,
        sessions,
        saveSession,
        getSession,
        createSessionId,
        rootPromptsSuggestions: samplePrompts
    };
}

export const useDataTalk = () => useContext(DataTalkConfigContext);

export function DataTalkProvider({
                                     config,
                                     children,
                                 }: { config: DataTalkConfig, children: React.ReactNode }) {

    return <DataTalkConfigContext.Provider value={config}>
        {children}
    </DataTalkConfigContext.Provider>;
}

const timestampToDateConverter = {
    toFirestore(data: any) {
        return data; // This can be customized based on your write needs
    },
    fromFirestore(snapshot: any, options: any) {
        const data = snapshot.data(options);
        return convertTimestamps(data);
    }
};

function convertTimestamps(data: any): any {
    if (data instanceof Timestamp) {
        return data.toDate(); // Convert Timestamp directly if the item is a Timestamp
    } else if (Array.isArray(data)) {
        return data.map(item => convertTimestamps(item)); // Process arrays recursively
    } else if (data !== null && typeof data === "object") {
        for (const key in data) {
            data[key] = convertTimestamps(data[key]); // Recursively process object properties
        }
        return data;
    }
    return data; // Return the data if it is neither a Timestamp nor a complex object/array
}
