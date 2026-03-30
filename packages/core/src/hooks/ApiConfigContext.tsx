import React, { useContext } from "react";

/**
 * Configuration for API connectivity. Passed once at the top level
 * and available to any hook that needs `apiUrl` or `getAuthToken`.
 *
 * Individual hooks can still accept explicit overrides — this context
 * serves as a fallback to eliminate repetitive threading.
 */
export interface ApiConfig {
    apiUrl: string;
    getAuthToken?: () => Promise<string | null>;
}

const ApiConfigContext = React.createContext<ApiConfig | undefined>(undefined);

/**
 * Read the API config from context. Returns `undefined` if no provider is present,
 * allowing hooks to fall back to their own props.
 */
export function useApiConfig(): ApiConfig | undefined {
    return useContext(ApiConfigContext);
}

/**
 * Provide API configuration (apiUrl, getAuthToken) to the entire subtree.
 * Typically rendered inside `<Rebase>` or at the app root.
 */
export function ApiConfigProvider({
    apiUrl,
    getAuthToken,
    children
}: ApiConfig & { children: React.ReactNode }) {
    const value = React.useMemo(() => ({ apiUrl, getAuthToken }), [apiUrl, getAuthToken]);
    return (
        <ApiConfigContext.Provider value={value}>
            {children}
        </ApiConfigContext.Provider>
    );
}
