import { ApiError } from "@firecms/cloud";
import { GCPProjectLocation } from "../types/gcp_locations";
import { handleApiResponse } from "./common";
import { GoogleProject, GoogleProjectConfigurationStatus } from "../types/google_projects";
import { ServiceAccount } from "../types/service_account";

const SERVER = import.meta.env.VITE_API_SERVER;

export function fetchGoogleProjects(firebaseAccessToken: string, googleAccessToken: string): Promise<GoogleProject[]> {
    return fetch(SERVER + "/gcp_projects/",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${firebaseAccessToken}`,
                "x-admin-authorization": `Bearer ${googleAccessToken}`
            }
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                console.error("fetchGoogleProjects", data);
                throw Error(data.message);
            }
            return data.data;
        });
}

export function fetchGCPLocations(googleAccessToken?: string, serviceAccount?: ServiceAccount): Promise<GCPProjectLocation[]> {
    return fetch(SERVER + "/gcp_projects/available_locations/",
        {
            method: "GET",
            headers: buildHeaders({
                googleAccessToken,
                serviceAccount
            }),
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                console.error("fetchGoogleProjects", data);
                throw Error(data.message);
            }
            return data.data;
        });
}

export function createNewGCPProject({
                                        projectId,
                                        name,
                                        locationId,
                                        firebaseAccessToken,
                                        googleAccessToken,
                                        serviceAccount
                                    }: {
    projectId: string,
    name: string,
    locationId: string,
    firebaseAccessToken: string,
    googleAccessToken?: string,
    serviceAccount?: ServiceAccount
}) {
    if (!googleAccessToken && !serviceAccount)
        throw new Error("Either googleAccessToken or serviceAccount must be provided");
    return fetch(SERVER + "/gcp_projects",
        {
            method: "POST",
            headers: buildHeaders({
                firebaseAccessToken,
                googleAccessToken,
                serviceAccount
            }),
            body: JSON.stringify({
                projectId,
                name,
                locationId
            })
        })
        .then(async (res) => {
            if (res.status === 409) // already exists
                throw new ApiError(`The project ID ${projectId} is already taken, please pick a different one`, "already-exists", projectId);
            return handleApiResponse(res, projectId).then((_) => true);
        });
}

export function verifyAuthIsEnabled({
                                        projectId,
                                        firebaseAccessToken,
                                        googleAccessToken,
                                        serviceAccount
                                    }: {
    projectId: string,
    firebaseAccessToken: string,
    googleAccessToken?: string,
    serviceAccount?: ServiceAccount
}): Promise<boolean> {
    if (!googleAccessToken && !serviceAccount)
        throw new Error("Either googleAccessToken or serviceAccount must be provided");
    return fetch(SERVER + `/gcp_projects/${projectId}/auth`,
        {
            method: "GET",
            headers: buildHeaders({
                firebaseAccessToken,
                googleAccessToken,
                serviceAccount
            })
        })
        .then((res) => handleApiResponse<{ auth_enabled: boolean }>(res, projectId))
        .then((res) => res.auth_enabled);

}

export function getProjectStatus({
                                     projectId,
                                     firebaseAccessToken,
                                     googleAccessToken,
                                     serviceAccount
                                 }: {
    projectId: string,
    firebaseAccessToken: string,
    googleAccessToken?: string,
    serviceAccount?: ServiceAccount
}): Promise<GoogleProjectConfigurationStatus> {
    if (!googleAccessToken && !serviceAccount)
        throw new Error("Either googleAccessToken or serviceAccount must be provided");
    return fetch(SERVER + `/gcp_projects/${projectId}`,
        {
            method: "GET",
            headers: buildHeaders({
                firebaseAccessToken,
                googleAccessToken,
                serviceAccount
            })
        })
        .then((res) => handleApiResponse<GoogleProjectConfigurationStatus>(res, projectId));
}

export function enableFirebase({
                                   projectId,
                                   firebaseAccessToken,
                                   googleAccessToken,
                                   serviceAccount
                               }: {
    projectId: string,
    firebaseAccessToken: string,
    googleAccessToken?: string,
    serviceAccount?: ServiceAccount
}): Promise<void> {
    if (!googleAccessToken && !serviceAccount)
        throw new Error("Either googleAccessToken or serviceAccount must be provided");
    return fetch(SERVER + `/gcp_projects/${projectId}/enable_firebase`,
        {
            method: "POST",
            headers: buildHeaders({
                firebaseAccessToken,
                googleAccessToken,
                serviceAccount
            })
        })
        .then((res) => handleApiResponse(res, projectId));
}

export function enableFirestore({
                                    projectId,
                                    locationId,
                                    firebaseAccessToken,
                                    googleAccessToken,
                                    serviceAccount
                                }: {
    projectId: string,
    locationId: string,
    firebaseAccessToken: string,
    googleAccessToken?: string,
    serviceAccount?: ServiceAccount
}): Promise<void> {
    if (!googleAccessToken && !serviceAccount)
        throw new Error("Either googleAccessToken or serviceAccount must be provided");
    return fetch(SERVER + `/gcp_projects/${projectId}/enable_firestore`,
        {
            method: "POST",
            headers: buildHeaders({
                firebaseAccessToken,
                googleAccessToken,
                serviceAccount
            }),
            body: JSON.stringify({
                locationId
            })
        })
        .then((res) => handleApiResponse(res, projectId));
}

export function enableStorage({
                                  projectId,
                                  locationId,
                                  firebaseAccessToken,
                                  googleAccessToken,
                                  serviceAccount
                              }: {
    projectId: string,
    locationId: string,
    firebaseAccessToken: string,
    googleAccessToken?: string,
    serviceAccount?: ServiceAccount
}): Promise<void> {
    if (!googleAccessToken && !serviceAccount)
        throw new Error("Either googleAccessToken or serviceAccount must be provided");
    return fetch(SERVER + `/gcp_projects/${projectId}/enable_storage`,
        {
            method: "POST",
            headers: buildHeaders({
                firebaseAccessToken,
                googleAccessToken,
                serviceAccount
            }),
            body: JSON.stringify({
                locationId
            })
        })
        .then((res) => handleApiResponse(res, projectId));
}

export function enableRequiredApis({
                                       projectId,
                                       firebaseAccessToken,
                                       googleAccessToken,
                                       serviceAccount
                                   }: {
    projectId: string,
    firebaseAccessToken: string,
    googleAccessToken?: string,
    serviceAccount?: ServiceAccount
}): Promise<void> {
    if (!googleAccessToken && !serviceAccount)
        throw new Error("Either googleAccessToken or serviceAccount must be provided");
    return fetch(SERVER + `/gcp_projects/${projectId}/enable_apis`,
        {
            method: "POST",
            headers: buildHeaders({
                firebaseAccessToken,
                googleAccessToken,
                serviceAccount
            })
        })
        .then((res) => handleApiResponse(res, projectId));
}

export function verifyServiceAccount({
                                         firebaseAccessToken,
                                         serviceAccount
                                     }: {
    firebaseAccessToken: string,
    serviceAccount: ServiceAccount
}): Promise<boolean> {
    console.debug("Verifying service account", serviceAccount);
    const projectId = serviceAccount.project_id;
    return fetch(SERVER + `/gcp_projects/${projectId}/verify_service_account`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${firebaseAccessToken}`
            },
            body: JSON.stringify({
                serviceAccount
            })
        })
        .then((res) => handleApiResponse<boolean>(res, projectId));
}

function buildHeaders({
                          firebaseAccessToken,
                          googleAccessToken,
                          serviceAccount
                      }: {
    firebaseAccessToken?: string,
    googleAccessToken?: string,
    serviceAccount?: ServiceAccount
}): Record<string, string> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
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
