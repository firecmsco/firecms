/**
 * @rebasepro/auth
 * 
 * Custom JWT authentication package for Rebase with PostgreSQL backend
 */

// Types
export type {
    RebaseAuthController,
    RebaseAuthControllerProps,
    AuthTokens,
    UserInfo,
    AuthResponse,
    RefreshResponse
} from "./types";

export { useRebaseAuthController } from "./hooks/useRebaseAuthController";
export { useBackendUserManagement } from "./hooks/useBackendUserManagement";
export type { BackendUserManagementConfig, UserManagement } from "./hooks/useBackendUserManagement";

// Components
export { RebaseAuth } from "./components/RebaseAuth";
export { RebaseLoginView } from "./components/RebaseLoginView";
export type { RebaseLoginViewProps } from "./components/RebaseLoginView";
export { createUserManagementAdminViews, UsersView, RolesView } from "./components/AdminViews";

// API utilities
export { setApiUrl, getApiUrl, fetchAuthConfig, AuthApiError } from "./api";
export type { AuthConfigResponse } from "./api";
