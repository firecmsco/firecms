import { FirebaseApp } from "firebase/app";
import { doc, Firestore, FirestoreError, getFirestore, onSnapshot } from "firebase/firestore";
import React, { useEffect, useRef } from "react";

export type GCPProjectCreationStatus =
    "creating_gcp_project" |
    "activating_firebase_for_gcp_project" |
    "enabling_firestore_api_in_gcp_project" |
    "creating_default_firestore_database_in_firebase" |
    "activating_storage_in_firebase";

export type GCPProjectCreationErrorCodes =
    "unknown_error" |
    "unknown_error_creating_gcp_project" |
    "user-has-to-accept-googles-terms-of-service" |
    "error_adding_firebase_to_gcp_project" |
    "error_enabling_firestore_api" |
    "error_creating_firestore_default_database" |
    "error_finalizing_project";

export type GCPProjectCreation = {
    status: GCPProjectCreationStatus;
    done: boolean;
    operationName: string;
    userId: string;
    error?: GCPProjectCreationErrorCodes;
}

/**
 * @group Firebase
 */
export interface GCPCreationFlowProps {

    projectId?: string;

    firebaseApp?: FirebaseApp;

    /**
     * Firestore collection where the configuration is saved.
     */
    configPath?: string;

}

export interface GCPCreationFlow {
    error?: Error;
    projectStatus?: GCPProjectCreation;
}

export function useGCPProjectStatus({
                                        projectId,
                                        firebaseApp,
                                        configPath = "gcp_projects"
                                    }: GCPCreationFlowProps): GCPCreationFlow {

    const firestoreRef = useRef<Firestore>();
    const firestore = firestoreRef.current;

    const [projectStatus, setProjectStatus] = React.useState<GCPProjectCreation | undefined>();
    const [error, setError] = React.useState<FirestoreError | undefined>();

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
    }, [firebaseApp]);

    useEffect(() => {
        if (!firestore || !configPath || !projectId) return;

        return onSnapshot(doc(firestore, configPath, projectId),
            {
                next: (snapshot) => {
                    setError(undefined);
                    setProjectStatus(snapshot.data() as GCPProjectCreation);
                },
                error: (e) => {
                    setError(e);
                }
            }
        );
    }, [configPath, firestore, projectId]);

    return {
        projectStatus: projectId ? projectStatus : undefined,
        error: projectId ? error : undefined
    }
}
