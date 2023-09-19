import { SaasUser, SaasUserProject } from "../types";
import { handleApiResponse } from "./common";

export type ProjectsApi = ReturnType<typeof buildProjectsApi>;

export function buildProjectsApi(host: string) {
    function createNewFireCMSProject(projectId: string, firebaseAccessToken: string, googleAccessToken: string) {
        return fetch(host + "/projects",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`,
                    "x-admin-authorization": `Bearer ${googleAccessToken}`
                },
                body: JSON.stringify({
                    projectId
                })
            })
            .then(async (res) => {
                return handleApiResponse(res, projectId).then((_) => true);
            });
    }

    function createFirebaseWebapp(projectId: string, firebaseAccessToken: string) {
        return fetch(host + `/projects/${projectId}/firebase_webapp`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                },
                body: JSON.stringify({
                    projectId
                })
            })
            .then(async (res) => {
                return handleApiResponse(res, projectId).then((_) => true);
            });
    }

    function addSecurityRules(projectId: string, firebaseAccessToken: string, googleAccessToken: string) {
        return fetch(host + `/projects/${projectId}/firestore_security_rules`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`,
                    "x-admin-authorization": `Bearer ${googleAccessToken}`
                }
            })
            .then(async (res) => {
                return handleApiResponse(res, projectId).then((_) => true);
            });
    }

    function createNewUser(firebaseAccessToken: string,
                           projectId: string,
                           user: SaasUser): Promise<SaasUserProject> {
        return fetch(host + "/projects/" + projectId + "/users",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                },
                body: JSON.stringify(user)
            })
            .then((res) => {
                return handleApiResponse<SaasUserProject>(res, projectId);
            });
    }

    function updateUser(firebaseAccessToken: string,
                        projectId: string,
                        uid: string,
                        user: SaasUser): Promise<SaasUserProject> {
        return fetch(host + "/projects/" + projectId + "/users/" + uid,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                },
                body: JSON.stringify(user)
            })
            .then((res) => {
                return handleApiResponse<SaasUserProject>(res, projectId);
            });
    }

    function deleteUser(firebaseAccessToken: string,
                        projectId: string,
                        uid: string): Promise<void> {
        return fetch(host + "/projects/" + projectId + "/users/" + uid,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                }
            })
            .then((res) => {
                return handleApiResponse<void>(res, projectId);
            });
    }

    function getRootCollections(firebaseAccessToken: string,
                                projectId: string,
                                googleAccessToken?: string): Promise<string[]> {
        const headers: {
            "Content-Type": string;
            Authorization: string;
            "x-admin-authorization"?: string;
        } = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${firebaseAccessToken}`
        };

        if (googleAccessToken) {
            headers["x-admin-authorization"] = `Bearer ${googleAccessToken}`;
        }

        return fetch(host + "/projects/" + projectId + "/firestore_root_collections",
            {
                method: "GET",
                headers
            })
            .then((res) => {
                return handleApiResponse<string[]>(res, projectId);
            });
    }

    function createServiceAccount(firebaseAccessToken: string,
                                  googleAccessToken: string,
                                  projectId: string): Promise<SaasUserProject> {
        return fetch(host + "/projects/" + projectId + "/service_accounts",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`,
                    "x-admin-authorization": `Bearer ${googleAccessToken}`
                }
            })
            .then(async (res) => {
                if (res.status === 409) // already exists
                    throw Error("The service account already exists for this project.")
                const data = await res.json();
                console.log("createServiceAccount res", res, data);
                return data.user as SaasUserProject;
            });
    }

    function doDelegatedLogin(firebaseAccessToken: string,
                              projectId: string): Promise<string> {
        return fetch(host + "/projects/" + projectId + "/delegated_login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                },
                body: JSON.stringify({
                    projectId
                })
            })
            .then(async (res) => {
                const data = await res.json();
                return data.data as string;
            });
    }

    function getStripePortalLink(firebaseAccessToken: string, projectId: string): Promise<string> {
        return fetch(`${host}/customer/stripe_portal_link?return_url=${encodeURIComponent(window.location.href)}&project_id=${projectId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${firebaseAccessToken}`
                }
            })
            .then(async (res) => {
                const data = await res.json();
                return data.url as string;
            });
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
        getStripePortalLink
    }
}
