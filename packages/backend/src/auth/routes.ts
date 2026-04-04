import { Hono, MiddlewareHandler } from "hono";
import { ApiError } from "../api/errors";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { randomBytes, createHash } from "crypto";
import { UserService, RoleService, RefreshTokenService, PasswordResetTokenService } from "./services";
import { generateAccessToken, generateRefreshToken, hashRefreshToken, getRefreshTokenExpiry, getAccessTokenExpiry } from "./jwt";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./password";
import { verifyGoogleIdToken, isGoogleOAuthConfigured } from "./google-oauth";
import { requireAuth } from "./middleware";
import { EmailService, EmailConfig } from "../email";
import { getPasswordResetTemplate, getEmailVerificationTemplate } from "../email/templates";
import { HonoEnv } from "../api/types";

// Rate limiting stub, to be properly implemented or replaced with @hono/rate-limit
const defaultAuthLimiter: MiddlewareHandler<any> = async (c, next) => await next();
const strictAuthLimiter: MiddlewareHandler<any> = async (c, next) => await next();

/**
 * Shared configuration for auth and admin route factories.
 */
export interface AuthModuleConfig {
    db: NodePgDatabase;
    emailService?: EmailService;
    emailConfig?: EmailConfig;
    /** Allow new user registration (default: false). First user can always register for bootstrap. */
    allowRegistration?: boolean;
}

/**
 * Helper to build standard auth response output
 */
function buildAuthResponse(
    user: { id: string; email: string; displayName: string | null; photoUrl: string | null },
    roleIds: string[],
    accessToken: string,
    refreshToken: string
) {
    return {
        user: {
            uid: user.id,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoUrl,
            roles: roleIds
        },
        tokens: {
            accessToken,
            refreshToken,
            accessTokenExpiresAt: getAccessTokenExpiry()
        }
    };
}

/**
 * Generate a secure random token
 */
function generateSecureToken(): string {
    return randomBytes(40).toString("hex");
}

/**
 * Hash a token for database storage
 */
function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

/**
 * Get password reset token expiry (1 hour from now)
 */
function getPasswordResetExpiry(): Date {
    return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
}

export function createAuthRoutes(config: AuthModuleConfig): Hono<HonoEnv> {
    const router = new Hono<HonoEnv>();
    const userService = new UserService(config.db);
    const roleService = new RoleService(config.db);
    const refreshTokenService = new RefreshTokenService(config.db);
    const passwordResetTokenService = new PasswordResetTokenService(config.db);
    const { emailService, emailConfig, allowRegistration = false } = config;

    /**
     * Check if email service is configured
     */
    function isEmailConfigured(): boolean {
        return !!(emailService && emailService.isConfigured());
    }

    /**
     * Check if registration is allowed (always allow first user for bootstrap)
     */
    async function isRegistrationAllowed(): Promise<boolean> {
        if (allowRegistration) return true;
        // Always allow first user registration for bootstrap
        const allUsers = await userService.listUsers();
        return allUsers.length === 0;
    }

    /**
     * POST /auth/register
     * Create a new account with email/password
     */
    router.post("/register", defaultAuthLimiter, async (c) => {
        const body = await c.req.json();
        const { email, password, displayName } = body;

        // Check if registration is allowed
        const registrationAllowed = await isRegistrationAllowed();
        if (!registrationAllowed) {
            throw ApiError.forbidden("Registration is disabled", "REGISTRATION_DISABLED");
        }

        if (!email || !password) {
            throw ApiError.badRequest("Email and password are required", "INVALID_INPUT");
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            throw ApiError.badRequest(passwordValidation.errors.join(". "), "WEAK_PASSWORD");
        }

        // Check if email already exists
        const existingUser = await userService.getUserByEmail(email);
        if (existingUser) {
            throw ApiError.conflict("Email already registered", "EMAIL_EXISTS");
        }

        // Create user
        const passwordHash = await hashPassword(password);
        const user = await userService.createUser({
            email: email.toLowerCase(),
            passwordHash,
            displayName: displayName || null,
            provider: "email"
        });

        // Check if this is the first user - make them admin
        const allUsers = await userService.listUsers();
        const isFirstUser = allUsers.length === 1;
        const defaultRole = isFirstUser ? "admin" : "editor";
        await userService.assignDefaultRole(user.id, defaultRole);

        // Generate tokens
        const roles = await userService.getUserRoles(user.id);
        const roleIds = roles.map(r => r.id);
        const accessToken = generateAccessToken(user.id, roleIds);
        const refreshToken = generateRefreshToken();

        // Store refresh token
        const userAgent = c.req.header("user-agent") || "unknown";
        const ipAddress = c.req.header("x-forwarded-for") || "unknown";
        
        await refreshTokenService.createToken(
            user.id,
            hashRefreshToken(refreshToken),
            getRefreshTokenExpiry(),
            userAgent,
            ipAddress
        );

        return c.json(buildAuthResponse(user, roleIds, accessToken, refreshToken), 201);
    });

    /**
     * POST /auth/login
     * Login with email/password
     */
    router.post("/login", defaultAuthLimiter, async (c) => {
        const body = await c.req.json();
        const { email, password } = body;

        if (!email || !password) {
            throw ApiError.badRequest("Email and password are required", "INVALID_INPUT");
        }

        const user = await userService.getUserByEmail(email);
        if (!user) {
            throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
        }

        if (!user.passwordHash) {
            throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
        }

        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
            throw ApiError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
        }

        // Generate tokens
        const roles = await userService.getUserRoles(user.id);
        const roleIds = roles.map(r => r.id);

        const accessToken = generateAccessToken(user.id, roleIds);
        const refreshToken = generateRefreshToken();

        // Store refresh token
        const userAgent = c.req.header("user-agent") || "unknown";
        const ipAddress = c.req.header("x-forwarded-for") || "unknown";
        
        await refreshTokenService.createToken(
            user.id,
            hashRefreshToken(refreshToken),
            getRefreshTokenExpiry(),
            userAgent,
            ipAddress
        );

        return c.json(buildAuthResponse(user, roleIds, accessToken, refreshToken));
    });

    /**
     * POST /auth/google
     * Login/register with Google ID token
     */
    router.post("/google", defaultAuthLimiter, async (c) => {
        const body = await c.req.json();
        const { idToken } = body;

        if (!idToken) {
            throw ApiError.badRequest("ID token is required", "INVALID_INPUT");
        }

        if (!isGoogleOAuthConfigured()) {
            throw ApiError.serviceUnavailable("Google login not configured", "NOT_CONFIGURED");
        }

        const googleUser = await verifyGoogleIdToken(idToken);
        if (!googleUser) {
            throw ApiError.unauthorized("Invalid Google token", "INVALID_TOKEN");
        }

        // Find or create user
        let user = await userService.getUserByGoogleId(googleUser.googleId);

        if (!user) {
            // Check if email exists (link accounts)
            user = await userService.getUserByEmail(googleUser.email);

            if (user) {
                // Link Google to existing account
                await userService.updateUser(user.id, { googleId: googleUser.googleId });
            } else {
                // Create new user
                user = await userService.createUser({
                    email: googleUser.email.toLowerCase(),
                    displayName: googleUser.displayName,
                    photoUrl: googleUser.photoUrl,
                    provider: "google",
                    googleId: googleUser.googleId
                });
                // Check if this is the first user - make them admin
                const allUsers = await userService.listUsers();
                const isFirstUser = allUsers.length === 1;
                const defaultRole = isFirstUser ? "admin" : "editor";
                await userService.assignDefaultRole(user.id, defaultRole);
            }
        } else {
            // Update profile info from Google
            await userService.updateUser(user.id, {
                displayName: googleUser.displayName || user.displayName,
                photoUrl: googleUser.photoUrl || user.photoUrl
            });
        }

        // Generate tokens
        const roles = await userService.getUserRoles(user.id);
        const roleIds = roles.map(r => r.id);
        const accessToken = generateAccessToken(user.id, roleIds);
        const refreshToken = generateRefreshToken();

        // Store refresh token
        const userAgent = c.req.header("user-agent") || "unknown";
        const ipAddress = c.req.header("x-forwarded-for") || "unknown";
        
        await refreshTokenService.createToken(
            user.id,
            hashRefreshToken(refreshToken),
            getRefreshTokenExpiry(),
            userAgent,
            ipAddress
        );

        return c.json(buildAuthResponse(user, roleIds, accessToken, refreshToken));
    });

    /**
     * POST /auth/forgot-password
     * Request password reset email
     */
    router.post("/forgot-password", strictAuthLimiter, async (c) => {
        const body = await c.req.json();
        const { email } = body;

        if (!email) {
            throw ApiError.badRequest("Email is required", "INVALID_INPUT");
        }

        // Check if email service is configured
        if (!isEmailConfigured()) {
            throw ApiError.serviceUnavailable("Email service not configured. Password reset is not available.", "EMAIL_NOT_CONFIGURED");
        }

        // Always return success (security: don't reveal if email exists)
        // But only send email if user exists
        const user = await userService.getUserByEmail(email);

        if (user) {
            // Generate reset token
            const token = generateSecureToken();
            const tokenHash = hashToken(token);
            const expiresAt = getPasswordResetExpiry();

            // Store hashed token
            await passwordResetTokenService.createToken(user.id, tokenHash, expiresAt);

            // Build reset URL
            const baseUrl = emailConfig?.resetPasswordUrl || "";
            const resetUrl = `${baseUrl}/reset-password?token=${token}`;

            // Get email template
            const appName = emailConfig?.appName || "Rebase";
            const templateFn = emailConfig?.templates?.passwordReset;
            const emailContent = templateFn
                ? templateFn(resetUrl, { email: user.email, displayName: user.displayName })
                : getPasswordResetTemplate(resetUrl, { email: user.email, displayName: user.displayName }, appName);

            // Send email
            try {
                await emailService!.send({
                    to: user.email,
                    subject: emailContent.subject,
                    html: emailContent.html,
                    text: emailContent.text
                });
            } catch (emailError: unknown) {
                console.error("Failed to send password reset email:", emailError instanceof Error ? emailError.message : emailError);
                // Don't reveal email sending failure to client
            }
        }

        // Always return success
        return c.json({
            success: true,
            message: "If an account with that email exists, a password reset link has been sent."
        });
    });

    /**
     * POST /auth/reset-password
     * Reset password using token
     */
    router.post("/reset-password", strictAuthLimiter, async (c) => {
        const body = await c.req.json();
        const { token, password } = body;

        if (!token || !password) {
            throw ApiError.badRequest("Token and password are required", "INVALID_INPUT");
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            throw ApiError.badRequest(passwordValidation.errors.join(". "), "WEAK_PASSWORD");
        }

        // Find valid token
        const tokenHash = hashToken(token);
        const storedToken = await passwordResetTokenService.findValidByHash(tokenHash);

        if (!storedToken) {
            throw ApiError.badRequest("Invalid or expired reset token", "INVALID_TOKEN");
        }

        // Update password
        const passwordHash = await hashPassword(password);
        await userService.updatePassword(storedToken.userId, passwordHash);

        // Mark token as used
        await passwordResetTokenService.markAsUsed(tokenHash);

        // Invalidate all refresh tokens (security: log out all sessions)
        await refreshTokenService.deleteAllForUser(storedToken.userId);

        return c.json({ success: true, message: "Password has been reset successfully" });
    });

    /**
     * POST /auth/change-password
     * Change password for authenticated user
     */
    router.post("/change-password", requireAuth, async (c) => {
        const userCtx = c.get("user") as { userId: string; roles?: string[] } | undefined;
        if (!userCtx) {
            throw ApiError.unauthorized("Not authenticated");
        }

        const body = await c.req.json();
        const { oldPassword, newPassword } = body;

        if (!oldPassword || !newPassword) {
            throw ApiError.badRequest("Old password and new password are required", "INVALID_INPUT");
        }

        // Get user
        const user = await userService.getUserById(userCtx.userId);
        if (!user || !user.passwordHash) {
            throw ApiError.badRequest("Cannot change password for this account", "INVALID_ACCOUNT");
        }

        // Verify old password
        const isValidOldPassword = await verifyPassword(oldPassword, user.passwordHash);
        if (!isValidOldPassword) {
            throw ApiError.unauthorized("Current password is incorrect", "INVALID_CREDENTIALS");
        }

        // Validate new password strength
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.valid) {
            throw ApiError.badRequest(passwordValidation.errors.join(". "), "WEAK_PASSWORD");
        }

        // Update password
        const passwordHash = await hashPassword(newPassword);
        await userService.updatePassword(user.id, passwordHash);

        // Invalidate all refresh tokens (security: log out all sessions)
        await refreshTokenService.deleteAllForUser(user.id);

        return c.json({ success: true, message: "Password has been changed successfully" });
    });

    /**
     * POST /auth/send-verification
     * Send email verification link (authenticated)
     */
    router.post("/send-verification", requireAuth, async (c) => {
        const userCtx = c.get("user") as { userId: string; roles?: string[] } | undefined;
        if (!userCtx) {
            throw ApiError.unauthorized("Not authenticated");
        }

        // Check if email service is configured
        if (!isEmailConfigured()) {
            throw ApiError.serviceUnavailable("Email service not configured. Email verification is not available.", "EMAIL_NOT_CONFIGURED");
        }

        const user = await userService.getUserById(userCtx.userId);
        if (!user) {
            throw ApiError.notFound("User not found");
        }

        if (user.emailVerified) {
            throw ApiError.badRequest("Email is already verified", "ALREADY_VERIFIED");
        }

        // Generate verification token
        const token = generateSecureToken();

        // Store hashed token in user record (raw token goes in the email URL)
        await userService.setVerificationToken(user.id, hashToken(token));

        // Build verification URL
        const baseUrl = emailConfig?.verifyEmailUrl || "";
        const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

        // Get email template
        const appName = emailConfig?.appName || "Rebase";
        const templateFn = emailConfig?.templates?.emailVerification;
        const emailContent = templateFn
            ? templateFn(verifyUrl, { email: user.email, displayName: user.displayName })
            : getEmailVerificationTemplate(verifyUrl, { email: user.email, displayName: user.displayName }, appName);

        // Send email
        await emailService!.send({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text
        });

        return c.json({ success: true, message: "Verification email sent" });
    });

    /**
     * GET /auth/verify-email
     * Verify email address using token
     */
    router.get("/verify-email", async (c) => {
        const token = c.req.query("token");

        if (!token) {
            throw ApiError.badRequest("Verification token is required", "INVALID_INPUT");
        }

        // Find user by hashed verification token
        const user = await userService.getUserByVerificationToken(hashToken(token));
        if (!user) {
            throw ApiError.badRequest("Invalid or expired verification token", "INVALID_TOKEN");
        }

        // Mark email as verified
        await userService.setEmailVerified(user.id, true);

        return c.json({ success: true, message: "Email verified successfully" });
    });

    /**
     * POST /auth/refresh
     * Refresh access token using refresh token
     */
    router.post("/refresh", async (c) => {
        const body = await c.req.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            throw ApiError.badRequest("Refresh token is required", "INVALID_INPUT");
        }

        const tokenHash = hashRefreshToken(refreshToken);
        const storedToken = await refreshTokenService.findByHash(tokenHash);

        if (!storedToken) {
            throw ApiError.unauthorized("Invalid refresh token", "INVALID_TOKEN");
        }

        if (new Date() > storedToken.expiresAt) {
            await refreshTokenService.deleteByHash(tokenHash);
            throw ApiError.unauthorized("Refresh token expired", "TOKEN_EXPIRED");
        }

        // Generate new tokens
        const roles = await userService.getUserRoles(storedToken.userId);
        const roleIds = roles.map(r => r.id);

        const newAccessToken = generateAccessToken(storedToken.userId, roleIds);
        const newRefreshToken = generateRefreshToken();

        // Rotate refresh token (delete old, create new)
        const userAgent = c.req.header("user-agent") || "unknown";
        const ipAddress = c.req.header("x-forwarded-for") || "unknown";
        
        await refreshTokenService.deleteByHash(tokenHash);
        await refreshTokenService.createToken(
            storedToken.userId,
            hashRefreshToken(newRefreshToken),
            getRefreshTokenExpiry(),
            userAgent,
            ipAddress
        );

        return c.json({
            tokens: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                accessTokenExpiresAt: getAccessTokenExpiry()
            }
        });
    });

    /**
     * POST /auth/logout
     * Invalidate refresh token
     */
    router.post("/logout", async (c) => {
        const body = await c.req.json();
        const { refreshToken } = body;

        if (refreshToken) {
            const tokenHash = hashRefreshToken(refreshToken);
            await refreshTokenService.deleteByHash(tokenHash);
        }

        return c.json({ success: true });
    });

    /**
     * GET /auth/sessions
     * Get active refresh tokens (sessions) for the current user
     */
    router.get("/sessions", requireAuth, async (c) => {
        const userCtx = c.get("user") as { userId: string; roles?: string[] } | undefined;
        if (!userCtx) {
            throw ApiError.unauthorized("Not authenticated");
        }

        const currentRefreshToken = c.req.header("x-refresh-token") as string;
        const currentTokenHash = currentRefreshToken ? hashRefreshToken(currentRefreshToken) : null;

        const sessions = await refreshTokenService.listForUser(userCtx.userId);

        const mappedSessions = sessions.map(s => ({
            id: s.id,
            userAgent: s.userAgent,
            ipAddress: s.ipAddress,
            createdAt: s.createdAt,
            isCurrentSession: currentTokenHash ? s.tokenHash === currentTokenHash : false
        }));

        return c.json({ sessions: mappedSessions });
    });

    /**
     * DELETE /auth/sessions
     * Delete all refresh tokens for the current user (remote logout every device)
     */
    router.delete("/sessions", requireAuth, async (c) => {
        const userCtx = c.get("user") as { userId: string; roles?: string[] } | undefined;
        if (!userCtx) {
            throw ApiError.unauthorized("Not authenticated");
        }

        await refreshTokenService.deleteAllForUser(userCtx.userId);
        return c.json({ success: true, message: "All sessions revoked successfully" });
    });

    /**
     * DELETE /auth/sessions/:id
     * Delete a specific refresh token (remote logout)
     */
    router.delete("/sessions/:id", requireAuth, async (c) => {
        const userCtx = c.get("user") as { userId: string; roles?: string[] } | undefined;
        if (!userCtx) {
            throw ApiError.unauthorized("Not authenticated");
        }

        const id = c.req.param("id");
        if (!id) {
            throw ApiError.badRequest("Session ID is required", "INVALID_INPUT");
        }

        await refreshTokenService.deleteById(id, userCtx.userId);
        return c.json({ success: true, message: "Session revoked successfully" });
    });

    /**
     * GET /auth/me
     * Get current authenticated user
     */
    router.get("/me", requireAuth, async (c) => {
        const userCtx = c.get("user") as { userId: string; roles?: string[] } | undefined;
        if (!userCtx) {
            throw ApiError.unauthorized("Not authenticated");
        }

        const result = await userService.getUserWithRoles(userCtx.userId);
        if (!result) {
            throw ApiError.notFound("User not found");
        }

        return c.json({
            user: {
                uid: result.user.id,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoUrl,
                emailVerified: result.user.emailVerified,
                roles: result.roles.map(r => r.id)
            }
        });
    });

    /**
     * PATCH /auth/me
     * Update current authenticated user profile
     */
    router.patch("/me", requireAuth, async (c) => {
        const userCtx = c.get("user") as { userId: string; roles?: string[] } | undefined;
        if (!userCtx) {
            throw ApiError.unauthorized("Not authenticated");
        }

        const body = await c.req.json();
        const { displayName, photoURL } = body;

        const updatedUser = await userService.updateUser(userCtx.userId, {
            displayName: displayName !== undefined ? displayName : undefined,
            photoUrl: photoURL !== undefined ? photoURL : undefined,
        });

        if (!updatedUser) {
            throw ApiError.notFound("User not found");
        }

        const result = await userService.getUserWithRoles(userCtx.userId);
        if (!result) {
            throw ApiError.notFound("User not found");
        }

        return c.json({
            user: {
                uid: result.user.id,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoUrl,
                emailVerified: result.user.emailVerified,
                roles: result.roles.map(r => r.id)
            }
        });
    });

    /**
     * GET /auth/config
     * Get public auth configuration (for frontend to know what's available)
     */
    router.get("/config", defaultAuthLimiter, async (c) => {
        const allUsers = await userService.listUsers();
        const needsSetup = allUsers.length === 0;
        const registrationAllowed = needsSetup || allowRegistration;
        return c.json({
            needsSetup,
            registrationEnabled: registrationAllowed,
            googleEnabled: isGoogleOAuthConfigured(),
            emailServiceEnabled: isEmailConfigured()
        });
    });

    return router;
}
