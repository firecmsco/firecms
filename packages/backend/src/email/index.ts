/**
 * Email module exports
 */

export type {
    EmailService,
    EmailSendOptions,
    SMTPConfig,
    EmailConfig,
    PasswordResetTemplateFunction,
    EmailVerificationTemplateFunction
} from "./types";

export { SMTPEmailService, createEmailService } from "./smtp-email-service";

export { getPasswordResetTemplate, getEmailVerificationTemplate } from "./templates";
