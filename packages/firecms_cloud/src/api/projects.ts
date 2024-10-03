import { ApiError, FireCMSCloudUserWithRoles } from "../types";
import { handleApiResponse } from "./common";

export type ProjectsApi = ReturnType<typeof buildProjectsApi>;

const rootCollectionsCache: { [key: string]: string[] } = {};

export function buildProjectsApi(host: string, getBackendAuthToken: () => Promise<string>) {

    async function createNewFireCMSProject(projectId: string, googleAccessToken: string | undefined, serviceAccount: object | undefined, creationType: "new" | "existing" | "existing_sa") {

        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + "/projects",
            {
                method: "POST",
                headers: buildHeaders({
                    firebaseAccessToken,
                    googleAccessToken,
                    serviceAccount
                }),
                body: JSON.stringify({
                    projectId,
                    creationType,
                    serviceAccount: serviceAccount ?? null
                })
            })
            .then(async (res) => {
                return handleApiResponse(res, projectId).then((_) => true);
            });
    }

    async function createFirebaseWebapp(projectId: string) {

        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + `/projects/${projectId}/firebase_webapp`,
            {
                method: "POST",
                headers: buildHeaders({ firebaseAccessToken }),
                body: JSON.stringify({
                    projectId
                })
            })
            .then(async (res) => {
                return handleApiResponse(res, projectId).then((_) => true);
            });
    }

    async function addSecurityRules(projectId: string, googleAccessToken?: string, serviceAccount?: object) {

        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + `/projects/${projectId}/firestore_security_rules`,
            {
                method: "PATCH",
                headers: buildHeaders({
                    firebaseAccessToken,
                    googleAccessToken,
                    serviceAccount
                }),
            })
            .then(async (res) => {
                return handleApiResponse(res, projectId).then((_) => true);
            });
    }

    async function createNewUser(projectId: string,
                                 user: FireCMSCloudUserWithRoles): Promise<FireCMSCloudUserWithRoles> {

        const firebaseAccessToken = await getBackendAuthToken();
        const persistedUserData = {
            ...user,
            roles: user.roles.map(r => r.id),
            updated_on: new Date()
        }
        return fetch(host + "/projects/" + projectId + "/users",
            {
                method: "POST",
                headers: buildHeaders({ firebaseAccessToken }),
                body: JSON.stringify(persistedUserData)
            })
            .then((res) => {
                return handleApiResponse<FireCMSCloudUserWithRoles>(res, projectId);
            });
    }

    async function updateUser(projectId: string,
                              uid: string,
                              user: FireCMSCloudUserWithRoles): Promise<FireCMSCloudUserWithRoles> {
        const firebaseAccessToken = await getBackendAuthToken();
        const persistedUserData = {
            ...user,
            roles: user.roles.map(r => r.id),
            updated_on: new Date()
        }
        console.log("Updating user", persistedUserData);
        return fetch(host + "/projects/" + projectId + "/users/" + uid,
            {
                method: "PATCH",
                headers: buildHeaders({ firebaseAccessToken }),
                body: JSON.stringify(persistedUserData)
            })
            .then((res) => {
                return handleApiResponse<FireCMSCloudUserWithRoles>(res, projectId);
            });
    }

    async function deleteUser(projectId: string,
                              uid: string): Promise<void> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + "/projects/" + projectId + "/users/" + uid,
            {
                method: "DELETE",
                headers: buildHeaders({ firebaseAccessToken })
            })
            .then((res) => {
                return handleApiResponse<void>(res, projectId);
            });
    }

    async function getRootCollections(projectId: string,
                                      googleAccessToken?: string,
                                      serviceAccount?: object,
                                      retries = 10): Promise<string[]> {
        if (rootCollectionsCache[projectId]) {
            return rootCollectionsCache[projectId];
        }

        const firebaseAccessToken = await getBackendAuthToken();

        async function retry() {
            // wait 2 seconds
            await new Promise(resolve => setTimeout(resolve, 5000));
            console.debug("Retrying getRootCollections", retries);
            return getRootCollections(projectId, googleAccessToken, serviceAccount, retries - 1);
        }

        return fetch(host + "/projects/" + projectId + "/firestore_root_collections",
            {
                method: "GET",
                headers: buildHeaders({
                    firebaseAccessToken,
                    googleAccessToken,
                    serviceAccount
                }),
            })
            .then(async (res) => {
                if (res.status >= 300) {
                    return await retry();
                }
                const result = await handleApiResponse<string[]>(res, projectId);
                rootCollectionsCache[projectId] = result;
                return result;
            })
            .catch(async (error) => {
                if (retries > 0) {
                    return await retry();
                } else {
                    throw error;
                }
            });
    }

    async function createServiceAccount(googleAccessToken: string,
                                        projectId: string): Promise<FireCMSCloudUserWithRoles> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + "/projects/" + projectId + "/service_accounts",
            {
                method: "POST",
                headers: buildHeaders({
                    firebaseAccessToken,
                    googleAccessToken
                }),
            })
            .then(async (res) => {
                if (res.status === 409) // already exists
                    throw Error("The service account already exists for this project.")
                const data = await res.json();
                return data.user as FireCMSCloudUserWithRoles;
            });
    }

    async function doDelegatedLogin(projectId: string): Promise<string> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(host + "/projects/" + projectId + "/delegated_login",
            {
                method: "POST",
                headers: buildHeaders({ firebaseAccessToken }),
                body: JSON.stringify({
                    projectId
                })
            })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) {
                    throw new ApiError(data.message, data.code, projectId, data.data);
                }
                return data.data as string;
            });
    }

    async function getStripePortalLink(): Promise<string> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(`${host}/customer/stripe_portal_link?return_url=${encodeURIComponent(window.location.href)}`,
            {
                method: "GET",
                headers: buildHeaders({ firebaseAccessToken }),
            })
            .then(async (res) => {
                const data = await res.json();
                return data.url as string;
            });
    }

    async function getStripeCancelLinkForSubscription(subscriptionId: string): Promise<string> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(`${host}/customer/stripe_portal_link/cancel_subscription?return_url=${encodeURIComponent(window.location.href)}&subscription_id=${subscriptionId}`,
            {
                method: "GET",
                headers: buildHeaders({ firebaseAccessToken }),
            })
            .then(async (res) => {
                const data = await res.json();
                return data.url as string;
            });
    }

    async function getStripeUpdateLinkForSubscription(subscriptionId: string): Promise<string> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(`${host}/customer/stripe_portal_link/update_subscription?return_url=${encodeURIComponent(window.location.href)}&subscription_id=${subscriptionId}`,
            {
                method: "GET",
                headers: buildHeaders({ firebaseAccessToken }),
            })
            .then(async (res) => {
                const data = await res.json();
                return data.url as string;
            });
    }

    async function getStripeUpdateLinkForPaymentMethod(subscriptionId: string): Promise<string> {
        const firebaseAccessToken = await getBackendAuthToken();
        return fetch(`${host}/customer/stripe_portal_link/update_payment_method?return_url=${encodeURIComponent(window.location.href)}&subscription_id=${subscriptionId}`,
            {
                method: "GET",
                headers: buildHeaders({ firebaseAccessToken }),
            })
            .then(async (res) => {
                const data = await res.json();
                return data.url as string;
            });
    }

    async function getRemoteConfigUrl(projectId: string, revisionId?: string) {
        return `${host}/projects/${projectId}/app_config/${revisionId}/${await getBackendAuthToken()}/remoteEntry.js`;
    }

    return {
        createNewFireCMSProject,
        createFirebaseWebapp,
        addSecurityRules,
        createServiceAccount,

        createNewUser,
        updateUser,
        deleteUser,
        getRootCollections,
        doDelegatedLogin,
        getStripePortalLink,
        getStripeUpdateLinkForSubscription,
        getStripeCancelLinkForSubscription,
        getStripeUpdateLinkForPaymentMethod,
        host,
        getRemoteConfigUrl
    }
}

function buildHeaders({
                          firebaseAccessToken,
                          googleAccessToken,
                          serviceAccount
                      }: {
    firebaseAccessToken: string,
    googleAccessToken?: string,
    serviceAccount?: object
}): Record<string, string> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (firebaseAccessToken) {
        headers.Authorization = `Bearer ${firebaseAccessToken}`;
    }
    if (googleAccessToken) {
        headers["x-admin-authorization"] = `Bearer ${googleAccessToken}`;
    }
    if (serviceAccount) {
        headers["x-admin-service-account"] = `Bearer ${btoa(JSON.stringify(serviceAccount))}`;
    }
    return headers;
}
