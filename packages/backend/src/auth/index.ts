// Auth module exports
export { configureJwt, generateAccessToken, verifyAccessToken, generateRefreshToken, hashRefreshToken, getRefreshTokenExpiry, getAccessTokenExpiry } from "./jwt";
export type { JwtConfig, AccessTokenPayload } from "./jwt";

export { hashPassword, verifyPassword, validatePasswordStrength } from "./password";
export type { PasswordValidationResult } from "./password";

export { configureGoogleOAuth, verifyGoogleIdToken, isGoogleOAuthConfigured } from "./google-oauth";
export type { GoogleUserInfo } from "./google-oauth";

export { requireAuth, requireAdmin, optionalAuth, extractUserFromToken, createAuthMiddleware } from "./middleware";
export type { AuthMiddlewareOptions, AuthResult } from "./middleware";

export { UserService, RoleService, RefreshTokenService, PasswordResetTokenService } from "./services";
export type { Role } from "./services";

export { createAuthRoutes } from "./routes";
export type { AuthModuleConfig } from "./routes";

export { createAdminRoutes } from "./admin-routes";

export { ensureAuthTablesExist } from "./ensure-tables";

export { createRateLimiter, defaultAuthLimiter, strictAuthLimiter } from "./rate-limiter";
