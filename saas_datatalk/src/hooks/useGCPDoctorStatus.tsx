import { FirebaseApp } from "firebase/app";
import { doc, Firestore, FirestoreError, getFirestore, onSnapshot } from "firebase/firestore";
import React, { useEffect, useRef } from "react";
import { GoogleProjectConfigurationStatus } from "../types/google_projects";

/**
 * @group Firebase
 */
export interface GCPStatusProps {

    projectId?: string;

    userId?: string;

    firebaseApp?: FirebaseApp;

}

export interface GCPStatus {
    error?: Error;
    requirements?: GoogleProjectConfigurationStatus;
}

export function useGCPDoctorStatus({
                                       projectId,
                                       userId,
                                       firebaseApp
                                   }: GCPStatusProps): GCPStatus {

    const firestoreRef = useRef<Firestore>();
    const firestore = firestoreRef.current;

    const [configStatus, setConfigStatus] = React.useState<GoogleProjectConfigurationStatus | undefined>();
    const [error, setError] = React.useState<FirestoreError | undefined>();

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
    }, [firebaseApp]);

    useEffect(() => {
        if (!firestore || !projectId) return;

        return onSnapshot(doc(firestore, `users/${userId}/doctor/${projectId}`),
            {
                next: (snapshot) => {
                    setError(undefined);
                    const status = snapshot.get("cloudProjectConfigurationStatus") as GoogleProjectConfigurationStatus;
                    setConfigStatus(status);
                },
                error: (e) => {
                    console.error(e);
                    setError(e);
                }
            }
        );
    }, [userId, firestore, projectId]);

    return {
        requirements: projectId ? configStatus : undefined,
        error: projectId ? error : undefined
    }
}
