/**
 * @firecms/auth
 * 
 * Custom JWT authentication package for FireCMS with PostgreSQL backend
 */

// Types
export type {
    CustomAuthController,
    CustomAuthControllerProps,
    AuthTokens,
    UserInfo,
    AuthResponse,
    RefreshResponse
} from "./types";

// Hooks
export { useCustomAuthController } from "./hooks/useCustomAuthController";
export { useBackendUserManagement } from "./hooks/useBackendUserManagement";
export type { BackendUserManagementConfig, UserManagement } from "./hooks/useBackendUserManagement";

// Components
export { CustomLoginView } from "./components/CustomLoginView";
export type { CustomLoginViewProps } from "./components/CustomLoginView";
export { createUserManagementAdminViews } from "./components/AdminViews";

// API utilities
export { setApiUrl, getApiUrl, AuthApiError } from "./api";
