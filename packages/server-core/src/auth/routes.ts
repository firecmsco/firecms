import { Hono } from "hono";
import { ApiError } from "../api/errors";
import { randomBytes, createHash } from "crypto";
import type { AuthRepository } from "./interfaces";
import { generateAccessToken, generateRefreshToken, hashRefreshToken, getRefreshTokenExpiry, getAccessTokenExpiry } from "./jwt";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./password";
import { verifyGoogleIdToken, isGoogleOAuthConfigured } from "./google-oauth";
import { requireAuth } from "./middleware";
import { EmailService, EmailConfig } from "../email";
import { getPasswordResetTemplate, getEmailVerificationTemplate } from "../email/templates";
import { HonoEnv } from "../api/types";
import { defaultAuthLimiter, strictAuthLimiter } from "./rate-limiter";
import { z } from "zod";

/**
 * Shared configuration for auth and admin route factories.
 */
export interface AuthModuleConfig {
    authRepo: AuthRepository;
    emailService?: EmailService;
    emailConfig?: EmailConfig;
    /** Allow new user registration (default: false). First user can always register for bootstrap. */
    allowRegistration?: boolean;
    /** Default role ID to assign to new users (default: none). The first user always gets "admin". */
    defaultRole?: string;
}

/**
 * Helper to build standard auth response output
 */
function buildAuthResponse(
    user: { id: string; email: string; displayName?: string | null; photoUrl?: string | null },
    roleIds: string[],
    accessToken: string,
    refreshToken: string
) {
    return {
        user: {
            uid: user.id,
            email: user.email,
            displayName: user.displayName ?? null,
            photoURL: user.photoUrl ?? null,
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
    const authRepo = config.authRepo;
    const { emailService, emailConfig, allowRegistration = false } = config;

    // ── Zod input schemas ──────────────────────────────────────────────
    const registerSchema = z.object({
        email: z.string().email("Invalid email address").max(255),
        password: z.string().min(1, "Password is required").max(128),
        displayName: z.string().max(255).optional()
    });
    const loginSchema = z.object({
        email: z.string().email("Invalid email address").max(255),
        password: z.string().min(1, "Password is required").max(128)
    });
    const googleSchema = z.object({
        idToken: z.string().min(1, "ID token is required")
    });
    const forgotPasswordSchema = z.object({
        email: z.string().email("Invalid email address").max(255)
    });
    const resetPasswordSchema = z.object({
        token: z.string().min(1, "Token is required"),
        password: z.string().min(1, "Password is required").max(128)
    });
    const changePasswordSchema = z.object({
        oldPassword: z.string().min(1, "Old password is required").max(128),
        newPassword: z.string().min(1, "New password is required").max(128)
    });
    const refreshSchema = z.object({
        refreshToken: z.string().min(1, "Refresh token is required")
    });
    const logoutSchema = z.object({
        refreshToken: z.string().optional()
    });
    const updateProfileSchema = z.object({
        displayName: z.string().max(255).optional(),
        photoURL: z.string().url().max(2048).optional()
    });

    /** Parse a Zod schema against the request body, throwing ApiError on failure */
    function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
        const result = schema.safeParse(body);
        if (!result.success) {
            const messages = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(". ");
            throw ApiError.badRequest(messages, "INVALID_INPUT");
        }
        return result.data;
    }

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
        const allUsers = await authRepo.listUsers();
        return allUsers.length === 0;
    }

    /**
     * POST /auth/register
     * Create a new account with email/password
     */
    router.post("/register", defaultAuthLimiter, async (c) => {
        const { email, password, displayName } = parseBody(registerSchema, await c.req.json());

        // Check if registration is allowed
        const registrationAllowed = await isRegistrationAllowed();
        if (!registrationAllowed) {
            throw ApiError.forbidden("Registration is disabled", "REGISTRATION_DISABLED");
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            throw ApiError.badRequest(passwordValidation.errors.join(". "), "WEAK_PASSWORD");
        }

        // Check if email already exists
        const existingUser = await authRepo.getUserByEmail(email);
        if (existingUser) {
            throw ApiError.conflict("Email already registered", "EMAIL_EXISTS");
        }

        // Create user
        const passwordHash = await hashPassword(password);
        const user = await authRepo.createUser({
            email: email.toLowerCase(),
            passwordHash,
            displayName: displayName || undefined,
            provider: "email"
        });

        // Check if this is the first user - make them admin
        const allUsers = await authRepo.listUsers();
        const isFirstUser = allUsers.length === 1;
        if (isFirstUser) {
            await authRepo.assignDefaultRole(user.id, "admin");
        } else if (config.defaultRole) {
            await authRepo.assignDefaultRole(user.id, config.defaultRole);
        }

        // Generate tokens
        const roles = await authRepo.getUserRoles(user.id);
        const roleIds = roles.map(r => r.id);
        const accessToken = generateAccessToken(user.id, roleIds);
        const refreshToken = generateRefreshToken();

        // Store refresh token
        const userAgent = c.req.header("user-agent") || "unknown";
        const ipAddress = c.req.header("x-forwarded-for") || "unknown";
        
        await authRepo.createRefreshToken(
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
        const { email, password } = parseBody(loginSchema, await c.req.json());

        const user = await authRepo.getUserByEmail(email);
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
        const roles = await authRepo.getUserRoles(user.id);
        const roleIds = roles.map(r => r.id);

        const accessToken = generateAccessToken(user.id, roleIds);
        const refreshToken = generateRefreshToken();

        // Store refresh token
        const userAgent = c.req.header("user-agent") || "unknown";
        const ipAddress = c.req.header("x-forwarded-for") || "unknown";
        
        await authRepo.createRefreshToken(
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
        const { idToken } = parseBody(googleSchema, await c.req.json());

        if (!isGoogleOAuthConfigured()) {
            throw ApiError.serviceUnavailable("Google login not configured", "NOT_CONFIGURED");
        }

        const googleUser = await verifyGoogleIdToken(idToken);
        if (!googleUser) {
            throw ApiError.unauthorized("Invalid Google token", "INVALID_TOKEN");
        }

        // Find or create user
        let user = await authRepo.getUserByGoogleId(googleUser.googleId);

        if (!user) {
            // Check if email exists (link accounts)
            user = await authRepo.getUserByEmail(googleUser.email);

            if (user) {
                // Link Google to existing account
                await authRepo.updateUser(user.id, { googleId: googleUser.googleId });
            } else {
                // Create new user
                user = await authRepo.createUser({
                    email: googleUser.email.toLowerCase(),
                    displayName: googleUser.displayName || undefined,
                    photoUrl: googleUser.photoUrl || undefined,
                    provider: "google",
                    googleId: googleUser.googleId
                });
                // Check if this is the first user - make them admin
                const allUsers = await authRepo.listUsers();
                const isFirstUser = allUsers.length === 1;
                if (isFirstUser) {
                    await authRepo.assignDefaultRole(user.id, "admin");
                } else if (config.defaultRole) {
                    await authRepo.assignDefaultRole(user.id, config.defaultRole);
                }
            }
        } else {
            // Update profile info from Google
            await authRepo.updateUser(user.id, {
                displayName: googleUser.displayName || user.displayName || undefined,
                photoUrl: googleUser.photoUrl || user.photoUrl || undefined
            });
        }

        // Generate tokens
        const roles = await authRepo.getUserRoles(user.id);
        const roleIds = roles.map(r => r.id);
        const accessToken = generateAccessToken(user.id, roleIds);
        const refreshToken = generateRefreshToken();

        // Store refresh token
        const userAgent = c.req.header("user-agent") || "unknown";
        const ipAddress = c.req.header("x-forwarded-for") || "unknown";
        
        await authRepo.createRefreshToken(
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
        const { email } = parseBody(forgotPasswordSchema, await c.req.json());

        // Check if email service is configured
        if (!isEmailConfigured()) {
            throw ApiError.serviceUnavailable("Email service not configured. Password reset is not available.", "EMAIL_NOT_CONFIGURED");
        }

        // Always return success (security: don't reveal if email exists)
        // But only send email if user exists
        const user = await authRepo.getUserByEmail(email);

        if (user) {
            // Generate reset token
            const token = generateSecureToken();
            const tokenHash = hashToken(token);
            const expiresAt = getPasswordResetExpiry();

            await authRepo.createPasswordResetToken(user.id, tokenHash, expiresAt);

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
        const { token, password } = parseBody(resetPasswordSchema, await c.req.json());

        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.valid) {
            throw ApiError.badRequest(passwordValidation.errors.join(". "), "WEAK_PASSWORD");
        }

        // Find valid token
        const tokenHash = hashToken(token);
        const storedToken = await authRepo.findValidPasswordResetToken(tokenHash);

        if (!storedToken) {
            throw ApiError.badRequest("Invalid or expired reset token", "INVALID_TOKEN");
        }

        // Update password
        const passwordHash = await hashPassword(password);
        await authRepo.updatePassword(storedToken.userId, passwordHash);

        // Mark token as used
        await authRepo.markPasswordResetTokenUsed(tokenHash);

        // Invalidate all refresh tokens (security: log out all sessions)
        await authRepo.deleteAllRefreshTokensForUser(storedToken.userId);

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

        const { oldPassword, newPassword } = parseBody(changePasswordSchema, await c.req.json());

        // Get user
        const user = await authRepo.getUserById(userCtx.userId);
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
        await authRepo.updatePassword(user.id, passwordHash);

        // Invalidate all refresh tokens (security: log out all sessions)
        await authRepo.deleteAllRefreshTokensForUser(user.id);

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

        const user = await authRepo.getUserById(userCtx.userId);
        if (!user) {
            throw ApiError.notFound("User not found");
        }

        if (user.emailVerified) {
            throw ApiError.badRequest("Email is already verified", "ALREADY_VERIFIED");
        }

        // Generate verification token
        const token = generateSecureToken();

        // Store hashed token in user record (raw token goes in the email URL)
        await authRepo.setVerificationToken(user.id, hashToken(token));

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
        const user = await authRepo.getUserByVerificationToken(hashToken(token));
        if (!user) {
            throw ApiError.badRequest("Invalid or expired verification token", "INVALID_TOKEN");
        }

        // Mark email as verified
        await authRepo.setEmailVerified(user.id, true);

        return c.json({ success: true, message: "Email verified successfully" });
    });

    /**
     * POST /auth/refresh
     * Refresh access token using refresh token
     */
    router.post("/refresh", async (c) => {
        const { refreshToken } = parseBody(refreshSchema, await c.req.json());

        const tokenHash = hashRefreshToken(refreshToken);
        const storedToken = await authRepo.findRefreshTokenByHash(tokenHash);

        if (!storedToken) {
            throw ApiError.unauthorized("Invalid refresh token", "INVALID_TOKEN");
        }

        if (new Date() > storedToken.expiresAt) {
            await authRepo.deleteRefreshToken(tokenHash);
            throw ApiError.unauthorized("Refresh token expired", "TOKEN_EXPIRED");
        }

        // Generate new tokens
        const roles = await authRepo.getUserRoles(storedToken.userId);
        const roleIds = roles.map(r => r.id);

        const newAccessToken = generateAccessToken(storedToken.userId, roleIds);
        const newRefreshToken = generateRefreshToken();

        // Rotate refresh token (delete old, create new)
        const userAgent = c.req.header("user-agent") || "unknown";
        const ipAddress = c.req.header("x-forwarded-for") || "unknown";
        
        await authRepo.deleteRefreshToken(tokenHash);
        await authRepo.createRefreshToken(
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
        const { refreshToken } = parseBody(logoutSchema, await c.req.json());

        if (refreshToken) {
            const tokenHash = hashRefreshToken(refreshToken);
            await authRepo.deleteRefreshToken(tokenHash);
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

        const sessions = await authRepo.listRefreshTokensForUser(userCtx.userId);

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

        await authRepo.deleteAllRefreshTokensForUser(userCtx.userId);
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

        await authRepo.deleteRefreshTokenById(id, userCtx.userId);
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

        const result = await authRepo.getUserWithRoles(userCtx.userId);
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

        const { displayName, photoURL } = parseBody(updateProfileSchema, await c.req.json());

        const updatedUser = await authRepo.updateUser(userCtx.userId, {
            displayName: displayName !== undefined ? displayName : undefined,
            photoUrl: photoURL !== undefined ? photoURL : undefined,
        });

        if (!updatedUser) {
            throw ApiError.notFound("User not found");
        }

        const result = await authRepo.getUserWithRoles(userCtx.userId);
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
        const allUsers = await authRepo.listUsers();
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
