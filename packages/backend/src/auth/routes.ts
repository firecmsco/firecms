import { Router, Request, Response } from "express";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { randomBytes, createHash } from "crypto";
import { UserService, RoleService, RefreshTokenService, PasswordResetTokenService } from "./services";
import { generateAccessToken, generateRefreshToken, hashRefreshToken, getRefreshTokenExpiry } from "./jwt";
import { hashPassword, verifyPassword, validatePasswordStrength } from "./password";
import { verifyGoogleIdToken, isGoogleOAuthConfigured } from "./google-oauth";
import { requireAuth, AuthenticatedRequest } from "./middleware";
import { EmailService, EmailConfig } from "../email";
import { getPasswordResetTemplate, getEmailVerificationTemplate } from "../email/templates";

export interface AuthRoutesConfig {
    db: NodePgDatabase;
    emailService?: EmailService;
    emailConfig?: EmailConfig;
    /** Allow new user registration (default: false). First user can always register for bootstrap. */
    allowRegistration?: boolean;
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

export function createAuthRoutes(config: AuthRoutesConfig): Router {
    const router = Router();
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
    router.post("/register", async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password, displayName } = req.body;

            // Check if registration is allowed
            const registrationAllowed = await isRegistrationAllowed();
            if (!registrationAllowed) {
                res.status(403).json({ error: { message: "Registration is disabled", code: "REGISTRATION_DISABLED" } });
                return;
            }

            if (!email || !password) {
                res.status(400).json({ error: { message: "Email and password are required", code: "INVALID_INPUT" } });
                return;
            }

            // Validate password strength
            const passwordValidation = validatePasswordStrength(password);
            if (!passwordValidation.valid) {
                res.status(400).json({ error: { message: passwordValidation.errors.join(". "), code: "WEAK_PASSWORD" } });
                return;
            }

            // Check if email already exists
            const existingUser = await userService.getUserByEmail(email);
            if (existingUser) {
                res.status(409).json({ error: { message: "Email already registered", code: "EMAIL_EXISTS" } });
                return;
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
            await refreshTokenService.createToken(user.id, hashRefreshToken(refreshToken), getRefreshTokenExpiry());

            res.status(201).json({
                user: {
                    uid: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoUrl,
                    roles: roleIds
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            });
        } catch (error: any) {
            console.error("Registration error:", error);
            res.status(500).json({ error: { message: "Registration failed", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * POST /auth/login
     * Login with email/password
     */
    router.post("/login", async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: { message: "Email and password are required", code: "INVALID_INPUT" } });
                return;
            }

            const user = await userService.getUserByEmail(email);
            if (!user || !user.passwordHash) {
                res.status(401).json({ error: { message: "Invalid email or password", code: "INVALID_CREDENTIALS" } });
                return;
            }

            const isValidPassword = await verifyPassword(password, user.passwordHash);
            if (!isValidPassword) {
                res.status(401).json({ error: { message: "Invalid email or password", code: "INVALID_CREDENTIALS" } });
                return;
            }

            // Generate tokens
            const roles = await userService.getUserRoles(user.id);
            const roleIds = roles.map(r => r.id);
            const accessToken = generateAccessToken(user.id, roleIds);
            const refreshToken = generateRefreshToken();

            // Store refresh token
            await refreshTokenService.createToken(user.id, hashRefreshToken(refreshToken), getRefreshTokenExpiry());

            res.json({
                user: {
                    uid: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoUrl,
                    roles: roleIds
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            });
        } catch (error: any) {
            console.error("Login error:", error);
            res.status(500).json({ error: { message: "Login failed", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * POST /auth/google
     * Login/register with Google ID token
     */
    router.post("/google", async (req: Request, res: Response): Promise<void> => {
        try {
            const { idToken } = req.body;

            if (!idToken) {
                res.status(400).json({ error: { message: "ID token is required", code: "INVALID_INPUT" } });
                return;
            }

            if (!isGoogleOAuthConfigured()) {
                res.status(503).json({ error: { message: "Google login not configured", code: "NOT_CONFIGURED" } });
                return;
            }

            const googleUser = await verifyGoogleIdToken(idToken);
            if (!googleUser) {
                res.status(401).json({ error: { message: "Invalid Google token", code: "INVALID_TOKEN" } });
                return;
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
            await refreshTokenService.createToken(user.id, hashRefreshToken(refreshToken), getRefreshTokenExpiry());

            res.json({
                user: {
                    uid: user.id,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoUrl,
                    roles: roleIds
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            });
        } catch (error: any) {
            console.error("Google login error:", error);
            res.status(500).json({ error: { message: "Google login failed", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * POST /auth/forgot-password
     * Request password reset email
     */
    router.post("/forgot-password", async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({ error: { message: "Email is required", code: "INVALID_INPUT" } });
                return;
            }

            // Check if email service is configured
            if (!isEmailConfigured()) {
                res.status(503).json({
                    error: {
                        message: "Email service not configured. Password reset is not available.",
                        code: "EMAIL_NOT_CONFIGURED"
                    }
                });
                return;
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
                const appName = emailConfig?.appName || "FireCMS";
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
                } catch (emailError: any) {
                    console.error("Failed to send password reset email:", emailError.message);
                    // Don't reveal email sending failure to client
                }
            }

            // Always return success
            res.json({
                success: true,
                message: "If an account with that email exists, a password reset link has been sent."
            });
        } catch (error: any) {
            console.error("Forgot password error:", error);
            res.status(500).json({ error: { message: "Failed to process request", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * POST /auth/reset-password
     * Reset password using token
     */
    router.post("/reset-password", async (req: Request, res: Response): Promise<void> => {
        try {
            const { token, password } = req.body;

            if (!token || !password) {
                res.status(400).json({ error: { message: "Token and password are required", code: "INVALID_INPUT" } });
                return;
            }

            // Validate password strength
            const passwordValidation = validatePasswordStrength(password);
            if (!passwordValidation.valid) {
                res.status(400).json({ error: { message: passwordValidation.errors.join(". "), code: "WEAK_PASSWORD" } });
                return;
            }

            // Find valid token
            const tokenHash = hashToken(token);
            const storedToken = await passwordResetTokenService.findValidByHash(tokenHash);

            if (!storedToken) {
                res.status(400).json({ error: { message: "Invalid or expired reset token", code: "INVALID_TOKEN" } });
                return;
            }

            // Update password
            const passwordHash = await hashPassword(password);
            await userService.updatePassword(storedToken.userId, passwordHash);

            // Mark token as used
            await passwordResetTokenService.markAsUsed(tokenHash);

            // Invalidate all refresh tokens (security: log out all sessions)
            await refreshTokenService.deleteAllForUser(storedToken.userId);

            res.json({ success: true, message: "Password has been reset successfully" });
        } catch (error: any) {
            console.error("Reset password error:", error);
            res.status(500).json({ error: { message: "Failed to reset password", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * POST /auth/change-password
     * Change password for authenticated user
     */
    router.post("/change-password", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: { message: "Not authenticated", code: "UNAUTHORIZED" } });
                return;
            }

            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                res.status(400).json({ error: { message: "Old password and new password are required", code: "INVALID_INPUT" } });
                return;
            }

            // Get user
            const user = await userService.getUserById(req.user.userId);
            if (!user || !user.passwordHash) {
                res.status(400).json({ error: { message: "Cannot change password for this account", code: "INVALID_ACCOUNT" } });
                return;
            }

            // Verify old password
            const isValidOldPassword = await verifyPassword(oldPassword, user.passwordHash);
            if (!isValidOldPassword) {
                res.status(401).json({ error: { message: "Current password is incorrect", code: "INVALID_CREDENTIALS" } });
                return;
            }

            // Validate new password strength
            const passwordValidation = validatePasswordStrength(newPassword);
            if (!passwordValidation.valid) {
                res.status(400).json({ error: { message: passwordValidation.errors.join(". "), code: "WEAK_PASSWORD" } });
                return;
            }

            // Update password
            const passwordHash = await hashPassword(newPassword);
            await userService.updatePassword(user.id, passwordHash);

            // Invalidate all refresh tokens (security: log out all sessions)
            await refreshTokenService.deleteAllForUser(user.id);

            res.json({ success: true, message: "Password has been changed successfully" });
        } catch (error: any) {
            console.error("Change password error:", error);
            res.status(500).json({ error: { message: "Failed to change password", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * POST /auth/send-verification
     * Send email verification link (authenticated)
     */
    router.post("/send-verification", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: { message: "Not authenticated", code: "UNAUTHORIZED" } });
                return;
            }

            // Check if email service is configured
            if (!isEmailConfigured()) {
                res.status(503).json({
                    error: {
                        message: "Email service not configured. Email verification is not available.",
                        code: "EMAIL_NOT_CONFIGURED"
                    }
                });
                return;
            }

            const user = await userService.getUserById(req.user.userId);
            if (!user) {
                res.status(404).json({ error: { message: "User not found", code: "NOT_FOUND" } });
                return;
            }

            if (user.emailVerified) {
                res.status(400).json({ error: { message: "Email is already verified", code: "ALREADY_VERIFIED" } });
                return;
            }

            // Generate verification token
            const token = generateSecureToken();

            // Store token in user record
            await userService.setVerificationToken(user.id, token);

            // Build verification URL
            const baseUrl = emailConfig?.verifyEmailUrl || "";
            const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

            // Get email template
            const appName = emailConfig?.appName || "FireCMS";
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

            res.json({ success: true, message: "Verification email sent" });
        } catch (error: any) {
            console.error("Send verification error:", error);
            res.status(500).json({ error: { message: "Failed to send verification email", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * GET /auth/verify-email
     * Verify email address using token
     */
    router.get("/verify-email", async (req: Request, res: Response): Promise<void> => {
        try {
            const { token } = req.query;

            if (!token || typeof token !== "string") {
                res.status(400).json({ error: { message: "Verification token is required", code: "INVALID_INPUT" } });
                return;
            }

            // Find user by verification token
            const user = await userService.getUserByVerificationToken(token);
            if (!user) {
                res.status(400).json({ error: { message: "Invalid or expired verification token", code: "INVALID_TOKEN" } });
                return;
            }

            // Mark email as verified
            await userService.setEmailVerified(user.id, true);

            res.json({ success: true, message: "Email verified successfully" });
        } catch (error: any) {
            console.error("Verify email error:", error);
            res.status(500).json({ error: { message: "Failed to verify email", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * POST /auth/refresh
     * Refresh access token using refresh token
     */
    router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({ error: { message: "Refresh token is required", code: "INVALID_INPUT" } });
                return;
            }

            const tokenHash = hashRefreshToken(refreshToken);
            const storedToken = await refreshTokenService.findByHash(tokenHash);

            if (!storedToken) {
                res.status(401).json({ error: { message: "Invalid refresh token", code: "INVALID_TOKEN" } });
                return;
            }

            if (new Date() > storedToken.expiresAt) {
                await refreshTokenService.deleteByHash(tokenHash);
                res.status(401).json({ error: { message: "Refresh token expired", code: "TOKEN_EXPIRED" } });
                return;
            }

            // Generate new tokens
            const roles = await userService.getUserRoles(storedToken.userId);
            const roleIds = roles.map(r => r.id);
            const newAccessToken = generateAccessToken(storedToken.userId, roleIds);
            const newRefreshToken = generateRefreshToken();

            // Rotate refresh token (delete old, create new)
            await refreshTokenService.deleteByHash(tokenHash);
            await refreshTokenService.createToken(storedToken.userId, hashRefreshToken(newRefreshToken), getRefreshTokenExpiry());

            res.json({
                tokens: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken
                }
            });
        } catch (error: any) {
            console.error("Token refresh error:", error);
            res.status(500).json({ error: { message: "Token refresh failed", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * POST /auth/logout
     * Invalidate refresh token
     */
    router.post("/logout", async (req: Request, res: Response): Promise<void> => {
        try {
            const { refreshToken } = req.body;

            if (refreshToken) {
                const tokenHash = hashRefreshToken(refreshToken);
                await refreshTokenService.deleteByHash(tokenHash);
            }

            res.json({ success: true });
        } catch (error: any) {
            console.error("Logout error:", error);
            res.status(500).json({ error: { message: "Logout failed", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * GET /auth/me
     * Get current authenticated user
     */
    router.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: { message: "Not authenticated", code: "UNAUTHORIZED" } });
                return;
            }

            const result = await userService.getUserWithRoles(req.user.userId);
            if (!result) {
                res.status(404).json({ error: { message: "User not found", code: "NOT_FOUND" } });
                return;
            }

            res.json({
                user: {
                    uid: result.user.id,
                    email: result.user.email,
                    displayName: result.user.displayName,
                    photoURL: result.user.photoUrl,
                    emailVerified: result.user.emailVerified,
                    roles: result.roles.map(r => r.id)
                }
            });
        } catch (error: any) {
            console.error("Get user error:", error);
            res.status(500).json({ error: { message: "Failed to get user", code: "INTERNAL_ERROR" } });
        }
    });

    /**
     * GET /auth/config
     * Get public auth configuration (for frontend to know what's available)
     */
    router.get("/config", async (_req: Request, res: Response): Promise<void> => {
        try {
            const registrationAllowed = await isRegistrationAllowed();
            res.json({
                registrationEnabled: registrationAllowed,
                googleEnabled: isGoogleOAuthConfigured(),
                emailServiceEnabled: isEmailConfigured()
            });
        } catch (error: any) {
            console.error("Get config error:", error);
            res.status(500).json({ error: { message: "Failed to get config", code: "INTERNAL_ERROR" } });
        }
    });

    return router;
}

