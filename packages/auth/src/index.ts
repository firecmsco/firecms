/**
 * @rebasepro/auth
 * 
 * Custom JWT authentication adapter for the Rebase backend.
 * This package provides backend-specific auth hooks and API utilities.
 * 
 * For the generic LoginView and RebaseAuth components, see @rebasepro/core.
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

// Legacy re-exports for backward compatibility
// The UI components have moved to @rebasepro/core
export { RebaseLoginView } from "./components/RebaseLoginView";
export type { RebaseLoginViewProps } from "./components/RebaseLoginView";
export { RebaseAuth } from "./components/RebaseAuth";
export { createUserManagementAdminViews, UsersView, RolesView } from "./components/AdminViews";

// API utilities
export { setApiUrl, getApiUrl, fetchAuthConfig, AuthApiError } from "./api";
export type { AuthConfigResponse } from "./api";
