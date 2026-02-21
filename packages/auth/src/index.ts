/**
 * @firecms/auth
 * 
 * Custom JWT authentication package for FireCMS with PostgreSQL backend
 */

// Types
export type {
    FireCMSAuthController,
    FireCMSAuthControllerProps,
    AuthTokens,
    UserInfo,
    AuthResponse,
    RefreshResponse
} from "./types";

export { useFireCMSAuthController } from "./hooks/useFireCMSAuthController";
export { useBackendUserManagement } from "./hooks/useBackendUserManagement";
export type { BackendUserManagementConfig, UserManagement } from "./hooks/useBackendUserManagement";

// Components
export { FireCMSLoginView } from "./components/FireCMSLoginView";
export type { FireCMSLoginViewProps } from "./components/FireCMSLoginView";
export { createUserManagementAdminViews } from "./components/AdminViews";

// API utilities
export { setApiUrl, getApiUrl, AuthApiError } from "./api";
