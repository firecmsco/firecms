import { FirebaseApp } from "@firebase/app";
import {
    addDoc,
    collection,
    DocumentReference,
    Firestore,
    getDoc,
    getDocs,
    getFirestore,
    onSnapshot,
    query,
    where
} from "@firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { Product, ProductPrice, ProductWithPrices, Subscription, SubscriptionType } from "../types/subscriptions";
import { useFireCMSBackend } from "./useFireCMSBackend";

export const SUBSCRIPTIONS_COLLECTION = "subscriptions";
export const PRODUCTS_COLLECTION = "products";
export const CUSTOMERS_COLLECTION = "customers";
export const CHECKOUT_SESSION_COLLECTION = "checkout_sessions";

/**
 * @group Firebase
 */
export interface SubscriptionsForUserControllerProps {
}

export interface SubscriptionsController {
    activeSubscriptions?: Subscription[];
    activeSubscriptionsLoading: boolean;
    activeSubscriptionsLoadingError?: Error;
    getSubscriptionsForProject: (projectId: string) => Subscription[];
    subscribe: (projectId: string,
                productPrice: ProductPrice,
                onCheckoutSessionReady: (url: string, error: Error) => void,
                type: SubscriptionType
    ) => Promise<() => void>;
    products?: ProductWithPrices[];
    productsLoading: boolean;
    productsLoadingError?: Error;
}

export function useSubscriptionsForUserController(): SubscriptionsController {

    const { backendFirebaseApp: firebaseApp } = useFireCMSBackend();
    const { backendUid: userId } = useFireCMSBackend();

    const firestoreRef = useRef<Firestore>();

    const [products, setProducts] = useState<ProductWithPrices[] | undefined>();
    const [productsLoading, setProductsLoading] = useState<boolean>(true);
    const [productsLoadingError, setProductsLoadingError] = useState<Error | undefined>();

    const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
    const [activeSubscriptionsLoading, setActiveSubscriptionsLoading] = useState<boolean>(true);
    const [activeSubscriptionsLoadingError, setActiveSubscriptionsLoadingError] = useState<Error | undefined>();

    useEffect(() => {
        if (!firebaseApp) return;
        firestoreRef.current = getFirestore(firebaseApp);
    }, [firebaseApp]);

    /**
     * Keep products and prices in sync
     */
    useEffect(() => {
        const firestore = firestoreRef.current;
        if (!firestore) return;
        // Get docs from products collection where active is true
        const productsRef = collection(firestore, PRODUCTS_COLLECTION);

        return onSnapshot(query(productsRef, where("active", "==", true)), {
            next:
                async (querySnapshot) => {
                    const updatedProducts: ProductWithPrices[] = await Promise.all(querySnapshot.docs.map(async (productDoc) => {
                        const pricesRef = collection(firestore, PRODUCTS_COLLECTION, productDoc.id, "prices")
                        return getDocs(query(pricesRef, where("active", "==", true)))
                            .then(async (pricesQuery) => {
                                const prices: ProductPrice[] = pricesQuery.docs.map((priceDoc) => ({
                                    ...priceDoc.data(),
                                    id: priceDoc.id
                                } as ProductPrice));
                                prices.sort((a, b) => (b.default ? 1 : 0) - (a.default ? 1 : 0));
                                return {
                                    id: productDoc.id,
                                    ...productDoc.data(),
                                    prices
                                } as ProductWithPrices;
                            })
                    }));
                    setProductsLoadingError(undefined);
                    setProducts(updatedProducts);
                    setProductsLoading(false);
                },
            error: (error) => {
                setProductsLoadingError(error);
            }
        });

    }, [firestoreRef]);

    function fetchPrice(ref: DocumentReference): Promise<ProductPrice | undefined> {
        return getDoc(ref)
            .then((priceDoc) => {
                if (!priceDoc.exists()) {
                    return undefined;
                }
                return {
                    id: priceDoc.id,
                    ...(priceDoc.data() ?? {})
                } as ProductPrice;
            });
    }

    function fetchProduct(ref: DocumentReference): Promise<Product | undefined> {
        return getDoc(ref)
            .then((priceDoc) => {
                if (!priceDoc.exists()) {
                    return undefined;
                }
                return {
                    id: priceDoc.id,
                    ...(priceDoc.data() ?? {})
                } as Product;
            });
    }

    /**
     * Keep active subscriptions in sync
     */
    useEffect(() => {
        const firestore = firestoreRef.current;
        if (!firestore || !userId) return;
        const subscriptionsRef = collection(firestore, CUSTOMERS_COLLECTION, userId, SUBSCRIPTIONS_COLLECTION);

        return onSnapshot(query(subscriptionsRef, where("ended_at", "==", null)),
            {
                next:
                    async (snapshot) => {
                        const updatedSubscriptions = (
                            await Promise.all(snapshot.docs.map(async (doc) => {
                                const [price, product] = await Promise.all([fetchPrice(doc.data().price), fetchProduct(doc.data().product)]);
                                if (!price) {
                                    console.warn("Price not found for subscription", doc.id);
                                    return undefined;
                                }
                                return ({
                                    id: doc.id,
                                    ...doc.data(),
                                    price,
                                    product
                                } as Subscription);
                            }))
                        )
                            .filter(Boolean) as Subscription[];

                        setActiveSubscriptionsLoading(false);
                        setActiveSubscriptionsLoadingError(undefined);
                        setActiveSubscriptions(updatedSubscriptions);
                    },
                error: (error) => {
                    setActiveSubscriptionsLoadingError(error);
                }
            });
    }, [firestoreRef, userId]);

    const subscribe = async (projectId: string,
                             productPrice: ProductPrice,
                             onCheckoutSessionReady: (url: string, error: Error) => void,
                             type: SubscriptionType
    ): Promise<() => void> => {

        const firestore = firestoreRef.current;
        if (!firestore) throw new Error("Firestore not initialized");
        if (!userId) throw new Error("User not logged in");
        if (!type) throw new Error("subscription type not provided. Make sure to assign the metadata.type field in the Stripe dashboard to a product.");

        const subscriptionPricesRequest: any = {
            price: productPrice.id
        };

        // For prices with metered billing we need to omit the quantity parameter.
        // For all other prices we set quantity to 1.
        if (productPrice.recurring?.usage_type !== "metered")
            subscriptionPricesRequest.quantity = 1;

        const checkoutSession: any = {
            automatic_tax: true,
            tax_id_collection: true,
            collect_shipping_address: false,
            allow_promotion_codes: true,
            line_items: [subscriptionPricesRequest],
            trial_from_plan: true,
            trial_period_days: 28,
            success_url: `${window.location.origin}${window.location.pathname}`,
            cancel_url: `${window.location.origin}${window.location.pathname}`,
            metadata: {
                projectId,
                type
            }
        };

        // For one time payments set mode to payment.
        if (productPrice.type === "one_time") {
            checkoutSession.mode = "payment";
            checkoutSession.payment_method_types = ["card", "sepa_debit", "sofort"];
        }

        // Save checkout session to Firestore
        const checkoutSessionRef = collection(firestore, CUSTOMERS_COLLECTION, userId, CHECKOUT_SESSION_COLLECTION);

        const docRef = await addDoc(checkoutSessionRef, checkoutSession);

        return onSnapshot(docRef, (snap) => {
            const {
                error,
                url
            } = snap.data();
            onCheckoutSessionReady(url, error);
        })
    }

    const getSubscriptionsForProject = (projectId: string): Subscription[] => {
        return activeSubscriptions?.filter((subscription) => subscription.metadata.projectId === projectId);
    }

    return {
        products,
        subscribe,
        getSubscriptionsForProject,
        activeSubscriptions,
        productsLoading,
        productsLoadingError,
        activeSubscriptionsLoading,
        activeSubscriptionsLoadingError
    }
}
