import { FireCMSBackend } from "@firecms/cloud";
import { useCallback, useEffect, useRef, useState } from "react";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseApp } from "firebase/app";
import { fetchGoogleProjects } from "../api/gcp_projects";
import { GoogleProject, GoogleProjectsConfig } from "../types/google_projects";

interface GoogleProjectsParams {
    firebaseApp?: FirebaseApp;
    fireCMSBackend: FireCMSBackend;
}

export function useGoogleProjects({
                                      firebaseApp,
                                      fireCMSBackend
                                  }: GoogleProjectsParams): GoogleProjectsConfig {

    const [googleProjects, setGoogleProjects] = useState<GoogleProject[] | undefined>();
    const [projectsLoading, setProjectsLoading] = useState<boolean>(false);
    const [projectsLoadingError, setProjectsLoadingError] = useState<Error | undefined>();

    const inProgress = useRef<boolean>(false);

    const firestoreRef = useRef<Firestore>();

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
    }, [firebaseApp]);

    const fetchGoogleProducts = useCallback(async () => {
        if (!fireCMSBackend.googleCredential?.accessToken) {
            setProjectsLoading(false);
            return;
        }
        if (inProgress.current) return;

        inProgress.current = true;
        setProjectsLoading(true);

        const accessToken = fireCMSBackend.googleCredential.accessToken;
        const firebaseToken = await fireCMSBackend.getBackendAuthToken();
        fetchGoogleProjects(firebaseToken, accessToken)
            .then(setGoogleProjects)
            .catch(e => setProjectsLoadingError(e))
            .finally(() => {
                inProgress.current = false;
                setProjectsLoading(false);
            });
    }, [fireCMSBackend.googleCredential?.accessToken]);

    useEffect(() => {
        fetchGoogleProducts();
    }, [fetchGoogleProducts]);

    return {
        googleProjects,
        projectsLoading,
        projectsLoadingError
    }
}
