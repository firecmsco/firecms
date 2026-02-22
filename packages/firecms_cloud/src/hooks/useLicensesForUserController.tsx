import {
    addDoc,
    collection,
    doc,
    DocumentReference,
    DocumentSnapshot,
    Firestore,
    getFirestore,
    onSnapshot,
    query,
    updateDoc,
    where
} from "@firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFireCMSBackend } from "./useFireCMSBackend";
import { ProLicense, Subscription } from "../types";
import { convertDocToSubscription } from "../api/firestore";

const CUSTOMERS_COLLECTION = "customers";
const LICENSES_COLLECTION = "licenses";
const SUBSCRIPTIONS_COLLECTION = "subscriptions";

export interface LicensesController {
    licenses?: ProLicense[];
    licenseLoading: boolean;
    licenseLoadingError?: Error;
    createLicense: (license: Partial<ProLicense>) => Promise<ProLicense>;
    updateLicense: (id: string, license: Partial<ProLicense>) => Promise<ProLicense>;
    listenSubscriptionsForLicense: (licenseId: string,
                                    onSubscriptionsUpdate: (subs: Subscription[]) => void,
                                    onError: (error: Error) => void) => () => void;
}

function convertDocToLicense(doc: DocumentSnapshot) {
    const data = doc.data();
    return ({
        id: doc.id,
        ...data,
        created_at: data?.created_at.toDate()
    } as ProLicense);
}

export function useLicensesForUserController(): LicensesController {

    const { backendFirebaseApp: firebaseApp } = useFireCMSBackend();
    const { backendUid: userId } = useFireCMSBackend();

    const firestoreRef = useRef<Firestore>();

    const [licenses, setLicenses] = useState<ProLicense[]>([]);
    const [licenseLoading, setLicensesLoading] = useState<boolean>(true);
    const [licenseLoadingError, setLicensesLoadingError] = useState<Error | undefined>();

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
    }, [firebaseApp]);

    /**
     * Keep active licenses in sync
     */
    useEffect(() => {
        const firestore = firestoreRef.current;
        if (!firestore || !userId) return;
        const licensesRef = collection(firestore, LICENSES_COLLECTION);

        return onSnapshot(query(licensesRef, where("created_by", "==", userId), where("archived", "==", false)),
            {
                next:
                    async (snapshot) => {
                        const updatedSubscriptions = snapshot.docs
                            .map(convertDocToLicense)
                            .filter(Boolean);
                        console.debug("Licenses updated", updatedSubscriptions);
                        setLicensesLoading(false);
                        setLicensesLoadingError(undefined);
                        setLicenses(updatedSubscriptions);
                    },
                error: (error) => {
                    setLicensesLoadingError(error);
                }
            });
    }, [firestoreRef, userId]);

    const createLicense = async (license: Partial<ProLicense>): Promise<ProLicense> => {
        const firestore = firestoreRef.current;
        if (!firestore || !userId)
            throw new Error("Firestore not initialized");
        const licensesRef = collection(firestore, LICENSES_COLLECTION);
        return addDoc(licensesRef, license).then((ref: DocumentReference) => {
            return {
                id: ref.id,
                ...license
            } as ProLicense
        });
    }

    const updateLicense = async (id: string, license: Partial<ProLicense>) => {
        const firestore = firestoreRef.current;
        if (!firestore || !userId)
            throw new Error("Firestore not initialized");
        const licensesRef = doc(firestore, LICENSES_COLLECTION, id);
        console.debug("Updating license", id, license);
        return updateDoc(licensesRef, license)
            .then(() => {
                return license as ProLicense;
            });
    }

    const listenSubscriptionsForLicense = useCallback((licenseId: string,
                                                       onSubscriptionsUpdate: (subs: Subscription[]) => void,
                                                       onError: (error: Error) => void
    ): () => void => {
        const firestore = firestoreRef.current;
        if (!firestore || !userId)
            throw new Error("Firestore not initialized");
        const subsRef = query(collection(firestore, CUSTOMERS_COLLECTION, userId, SUBSCRIPTIONS_COLLECTION), where("metadata.licenseId", "==", licenseId));

        return onSnapshot(subsRef,
            {
                next:
                    async (snapshot) => {
                        const updatedSubscriptions = (await Promise.all(snapshot.docs.map(convertDocToSubscription))).filter(Boolean) as Subscription[];
                        onSubscriptionsUpdate(updatedSubscriptions);
                    },
                error: (error) => {
                    console.error("Error listening to subscriptions", error);
                    onError(error);
                }
            });
    }, []);

    return {
        licenses,
        licenseLoading,
        licenseLoadingError,
        createLicense,
        updateLicense,
        listenSubscriptionsForLicense
    }
}
