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

// Components
export { CustomLoginView } from "./components/CustomLoginView";
export type { CustomLoginViewProps } from "./components/CustomLoginView";

// API utilities
export { setApiUrl, getApiUrl, AuthApiError } from "./api";
