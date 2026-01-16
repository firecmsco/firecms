/**
 * Email service types and interfaces
 */

/**
 * Options for sending an email
 */
export interface EmailSendOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Email service interface - abstraction for sending emails
 */
export interface EmailService {
    /**
     * Send an email
     */
    send(options: EmailSendOptions): Promise<void>;

    /**
     * Check if the email service is properly configured
     */
    isConfigured(): boolean;
}

/**
 * SMTP server configuration
 */
export interface SMTPConfig {
    host: string;
    port: number;
    secure?: boolean;
    auth?: {
        user: string;
        pass: string;
    };
}

/**
 * Template function for password reset emails
 */
export type PasswordResetTemplateFunction = (
    resetUrl: string,
    user: { email: string; displayName?: string | null }
) => { subject: string; html: string; text?: string };

/**
 * Template function for email verification emails
 */
export type EmailVerificationTemplateFunction = (
    verifyUrl: string,
    user: { email: string; displayName?: string | null }
) => { subject: string; html: string; text?: string };

/**
 * Complete email configuration
 */
export interface EmailConfig {
    /**
     * From address for all emails (e.g., "noreply@example.com" or "MyApp <noreply@example.com>")
     */
    from: string;

    /**
     * SMTP configuration for sending emails via SMTP server
     */
    smtp?: SMTPConfig;

    /**
     * Alternative: custom function to send emails
     * Use this for custom email providers (AWS SES SDK, Resend, etc.)
     */
    sendEmail?: (options: EmailSendOptions) => Promise<void>;

    /**
     * Base URL for password reset links (e.g., "https://myapp.com")
     * The reset link will be: {baseUrl}/reset-password?token={token}
     */
    resetPasswordUrl?: string;

    /**
     * Base URL for email verification links (e.g., "https://myapp.com")
     * The verification link will be: {baseUrl}/verify-email?token={token}
     */
    verifyEmailUrl?: string;

    /**
     * Application name to use in email templates
     */
    appName?: string;

    /**
     * Custom email templates (optional - defaults are provided)
     */
    templates?: {
        passwordReset?: PasswordResetTemplateFunction;
        emailVerification?: EmailVerificationTemplateFunction;
    };
}
