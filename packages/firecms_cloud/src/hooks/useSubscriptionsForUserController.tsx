import { collection, Firestore, getDocs, getFirestore, onSnapshot, query, where } from "@firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { ProductPrice, ProductWithPrices, Subscription, SubscriptionType } from "../types/subscriptions";
import { useFireCMSBackend } from "./useFireCMSBackend";
import { convertDocToSubscription } from "../api/firestore";

const SUBSCRIPTIONS_COLLECTION = "subscriptions";
const PRODUCTS_COLLECTION = "products";
const CUSTOMERS_COLLECTION = "customers";
const CHECKOUT_SESSION_COLLECTION = "checkout_sessions";

export type SubscribeParams = {
    projectId?: string,
    quantity?: number,
    licenseId?: string,
    productPrice: ProductPrice,
    onCheckoutSessionReady: (url?: string, error?: Error) => void,
    type: SubscriptionType
};

export interface SubscriptionsController {
    activeSubscriptions?: Subscription[];
    activeSubscriptionsLoading: boolean;
    activeSubscriptionsLoadingError?: Error;
    getSubscriptionsForProject: (projectId: string) => Subscription[];
    subscribe: (params: SubscribeParams) => Promise<void>;
    products?: ProductWithPrices[];
    productsLoading: boolean;
    productsLoadingError?: Error;
}

export function useSubscriptionsForUserController(): SubscriptionsController {

    const {
        backendFirebaseApp: firebaseApp,
        projectsApi
    } = useFireCMSBackend();
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
                        const updatedSubscriptions = (await Promise.all(snapshot.docs.map(convertDocToSubscription)))
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

    const subscribe = async (props: {
                                 projectId?: string,
                                 licenseId?: string,
                                 quantity?: number,
                                 productPrice: ProductPrice,
                                 onCheckoutSessionReady: (url?: string, error?: Error) => void,
                                 type: SubscriptionType
                             }
    ) => {
        const {
            projectId,
            licenseId,
            productPrice,
            quantity,
            onCheckoutSessionReady,
            type
        } = props;

        console.debug("Subscribing to product", props);
        const productPriceId = productPrice.id;
        const productPriceType = productPrice.type;
        try {
            const sessionUrl: string = await projectsApi.createStripeNewSubscriptionLink({
                ...props,
                productPriceId,
                productPriceType
            });
            onCheckoutSessionReady(sessionUrl, undefined);
        } catch (e: any) {
            console.error("Error subscribing to product", productPriceId, e);
            onCheckoutSessionReady(undefined, e);
        }

        // const firestore = firestoreRef.current;
        // if (!firestore) throw new Error("Firestore not initialized");
        // if (!userId) throw new Error("User not logged in");
        // if (!type) throw new Error("subscription type not provided. Make sure to assign the metadata.type field in the Stripe dashboard to a product.");
        //
        // const subscriptionPricesRequest: any = {
        //     price: productPrice.id
        // };
        //
        // // For prices with metered billing we need to omit the quantity parameter.
        // // For all other prices we set quantity to 1.
        // if (productPrice.recurring?.usage_type !== "metered")
        //     subscriptionPricesRequest.quantity = quantity ?? 1;
        //
        // const metadata: Record<string, string> = {
        //     type
        // };
        // if (projectId) {
        //     metadata.projectId = projectId;
        // }
        // if (licenseId) {
        //     metadata.licenseId = licenseId;
        // }
        //
        // const checkoutSession: any = {
        //     automatic_tax: true,
        //     tax_id_collection: true,
        //     collect_shipping_address: false,
        //     allow_promotion_codes: true,
        //     line_items: [subscriptionPricesRequest],
        //     trial_from_plan: true,
        //     trial_period_days: 28,
        //     success_url: `${window.location.origin}${window.location.pathname}`,
        //     cancel_url: `${window.location.origin}${window.location.pathname}`,
        //     metadata
        // };
        //
        // // For one time payments set mode to payment.
        // if (productPrice.type === "one_time") {
        //     checkoutSession.mode = "payment";
        //     checkoutSession.payment_method_types = ["card", "sepa_debit", "sofort"];
        // }
        //
        // // Save checkout session to Firestore
        // const checkoutSessionRef = collection(firestore, CUSTOMERS_COLLECTION, userId, CHECKOUT_SESSION_COLLECTION);
        // const docRef = await addDoc(checkoutSessionRef, checkoutSession);
        //
        // const unsubscribe = onSnapshot(docRef, (snap) => {
        //     const {
        //         error,
        //         url
        //     } = snap.data();
        //
        //     console.debug("Checkout session updated", snap.data());
        //     onCheckoutSessionReady(url, error);
        //
        //     if (url) {
        //         unsubscribe();
        //     } else if (error) {
        //         unsubscribe();
        //     }
        // });
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
