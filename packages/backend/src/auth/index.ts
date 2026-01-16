// Auth module exports
export { configureJwt, generateAccessToken, verifyAccessToken, generateRefreshToken, hashRefreshToken, getRefreshTokenExpiry } from "./jwt";
export type { JwtConfig, AccessTokenPayload } from "./jwt";

export { hashPassword, verifyPassword, validatePasswordStrength } from "./password";
export type { PasswordValidationResult } from "./password";

export { configureGoogleOAuth, verifyGoogleIdToken, isGoogleOAuthConfigured } from "./google-oauth";
export type { GoogleUserInfo } from "./google-oauth";

export { requireAuth, optionalAuth, extractUserFromToken } from "./middleware";
export type { AuthenticatedRequest } from "./middleware";

export { UserService, RoleService, RefreshTokenService, PasswordResetTokenService } from "./services";
export type { Role } from "./services";

export { createAuthRoutes } from "./routes";
export type { AuthRoutesConfig } from "./routes";

export { createAdminRoutes } from "./admin-routes";
export type { AdminRoutesConfig } from "./admin-routes";

export { ensureAuthTablesExist } from "./ensure-tables";
