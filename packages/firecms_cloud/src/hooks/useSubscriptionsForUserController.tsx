import { collection, Firestore, getDocs, getFirestore, onSnapshot, query, where } from "@firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { ProductPrice, ProductWithPrices, Subscription, SubscriptionType } from "../types/subscriptions";
import { useFireCMSBackend } from "./useFireCMSBackend";
import { convertDocToSubscription } from "../api/firestore";
import { useSnackbarController } from "@firecms/core";

const SUBSCRIPTIONS_COLLECTION = "subscriptions";
const PRODUCTS_COLLECTION = "products";
const CUSTOMERS_COLLECTION = "customers";

export type SubscribeParams = {
    projectId?: string,
    quantity?: number,
    licenseId?: string,
    productPrice: ProductPrice,
    onCheckoutSessionReady: (url?: string, error?: Error) => void,
    type: SubscriptionType
};

export type SubscribeCloudParams = {
    projectId: string,
    currency: string,
    onCheckoutSessionReady: (url?: string, error?: Error) => void,
};

export interface SubscriptionsController {
    activeSubscriptions?: Subscription[];
    activeSubscriptionsLoading: boolean;
    activeSubscriptionsLoadingError?: Error;
    getSubscriptionsForProject: (projectId: string) => Subscription[];
    subscribe: (params: SubscribeParams) => Promise<void>;
    subscribeCloud: (params: SubscribeCloudParams) => Promise<void>;
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
    const snackbar = useSnackbarController();
    const firestoreRef = useRef<Firestore>(undefined);

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
            snackbar.open({
                message: e?.message ?? "Error subscribing to product",
                type: "error"
            });
        }
    }

    const subscribeCloud = async (props: SubscribeCloudParams) => {
        const {
            projectId,
            currency,
            onCheckoutSessionReady,
        } = props;

        console.debug("Subscribing to product", props);
        await projectsApi.createCloudStripeNewSubscriptionLink({
            projectId,
            currency
        }).then((sessionUrl) => {
            onCheckoutSessionReady(sessionUrl, undefined);
        }).catch(e => {
            console.error("Error subscribing to Cloud", projectId, e);
            onCheckoutSessionReady(undefined, e);
        });
    }

    const getSubscriptionsForProject = (projectId: string): Subscription[] => {
        return activeSubscriptions?.filter((subscription) => subscription.metadata.projectId === projectId);
    }

    return {
        products,
        subscribe,
        subscribeCloud,
        getSubscriptionsForProject,
        activeSubscriptions,
        productsLoading,
        productsLoadingError,
        activeSubscriptionsLoading,
        activeSubscriptionsLoadingError
    }
}
