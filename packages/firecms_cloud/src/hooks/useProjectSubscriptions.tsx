import { collection, Firestore, getFirestore, onSnapshot, query, where } from "@firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Subscription } from "../types/subscriptions";
import { useFireCMSBackend } from "./useFireCMSBackend";
import { convertDocToSubscription } from "../api/firestore";

/**
 * Hook to listen for subscriptions stored under the project subcollection
 * (`projects/{projectId}/subscriptions`) rather than the user's customer
 * subcollection. This ensures that any team member viewing the project settings
 * can see the subscription, regardless of who originally created it.
 */
export function useProjectSubscriptions(projectId: string) {

    const {
        backendFirebaseApp: firebaseApp,
    } = useFireCMSBackend();

    const firestoreRef = useRef<Firestore>(undefined);

    const [subscriptions, setSubscriptions] = useState<Subscription[] | undefined>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | undefined>();

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
    }, [firebaseApp]);

    useEffect(() => {
        const firestore = firestoreRef.current;
        if (!firestore || !projectId) return;

        const subscriptionsRef = collection(firestore, "projects", projectId, "subscriptions");

        return onSnapshot(query(subscriptionsRef, where("ended_at", "==", null)),
            {
                next: async (snapshot) => {
                    const updatedSubscriptions = (await Promise.all(snapshot.docs.map(convertDocToSubscription)))
                        .filter(Boolean) as Subscription[];

                    setLoading(false);
                    setError(undefined);
                    setSubscriptions(updatedSubscriptions);
                },
                error: (error) => {
                    setLoading(false);
                    setError(error);
                }
            });
    }, [firestoreRef, projectId]);

    return {
        subscriptions,
        loading,
        error
    };
}
