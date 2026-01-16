import { createTransport, Transporter } from "nodemailer";
import { EmailService, EmailSendOptions, EmailConfig } from "./types";

/**
 * SMTP Email Service implementation using Nodemailer
 */
export class SMTPEmailService implements EmailService {
    private transporter: Transporter | null = null;
    private config: EmailConfig;

    constructor(config: EmailConfig) {
        this.config = config;

        if (config.smtp) {
            this.transporter = createTransport({
                host: config.smtp.host,
                port: config.smtp.port,
                secure: config.smtp.secure ?? (config.smtp.port === 465),
                auth: config.smtp.auth ? {
                    user: config.smtp.auth.user,
                    pass: config.smtp.auth.pass
                } : undefined
            });
        }
    }

    /**
     * Check if the email service is properly configured
     */
    isConfigured(): boolean {
        return !!(this.transporter || this.config.sendEmail);
    }

    /**
     * Send an email using SMTP or custom send function
     */
    async send(options: EmailSendOptions): Promise<void> {
        // Use custom send function if provided
        if (this.config.sendEmail) {
            await this.config.sendEmail(options);
            return;
        }

        // Use SMTP transporter
        if (!this.transporter) {
            throw new Error("Email service not configured. Provide SMTP config or sendEmail function.");
        }

        try {
            await this.transporter.sendMail({
                from: this.config.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text
            });
        } catch (error: any) {
            console.error("Failed to send email:", error.message);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    /**
     * Verify SMTP connection (useful for startup checks)
     */
    async verifyConnection(): Promise<boolean> {
        if (!this.transporter) {
            return !!this.config.sendEmail;
        }

        try {
            await this.transporter.verify();
            return true;
        } catch (error: any) {
            console.error("SMTP connection verification failed:", error.message);
            return false;
        }
    }
}

/**
 * Create an email service from configuration
 */
export function createEmailService(config: EmailConfig): EmailService {
    return new SMTPEmailService(config);
}
