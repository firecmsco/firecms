import axios from "axios";

export interface BackendFirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
}

/** One entry per backend: a staging and a production backend can share a process. */
const configCache = new Map<string, Promise<BackendFirebaseConfig>>();

/**
 * Fetch the public Firebase web config of the FireCMS backend at `apiUrl`.
 * This is the same unauthenticated endpoint the web app reads at boot.
 *
 * A failed fetch is not cached, so the next call tries again.
 */
export function getBackendFirebaseConfig(apiUrl: string): Promise<BackendFirebaseConfig> {
    const cached = configCache.get(apiUrl);
    if (cached) return cached;

    const pending = axios.get<BackendFirebaseConfig>(`${apiUrl}/config`, { timeout: 30_000 })
        .then((response) => response.data);
    configCache.set(apiUrl, pending);
    pending.catch(() => configCache.delete(apiUrl));
    return pending;
}
