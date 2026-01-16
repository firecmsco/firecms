/**
 * Default email templates for authentication emails
 */

interface TemplateUser {
    email: string;
    displayName?: string | null;
}

/**
 * Get a greeting name for the user
 */
function getGreeting(user: TemplateUser): string {
    return user.displayName || user.email.split("@")[0];
}

/**
 * Common email styles
 */
const styles = {
    container: `
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
        background-color: #f8fafc;
    `,
    card: `
        background-color: #ffffff;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `,
    heading: `
        color: #1e293b;
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 20px 0;
    `,
    paragraph: `
        color: #475569;
        font-size: 16px;
        line-height: 1.6;
        margin: 0 0 20px 0;
    `,
    button: `
        display: inline-block;
        background-color: #3b82f6;
        color: #ffffff;
        font-size: 16px;
        font-weight: 600;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 8px;
        margin: 20px 0;
    `,
    footer: `
        color: #94a3b8;
        font-size: 14px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
    `,
    warning: `
        color: #64748b;
        font-size: 14px;
        background-color: #fef3c7;
        padding: 12px 16px;
        border-radius: 6px;
        margin-top: 20px;
    `
};

/**
 * Default password reset email template
 */
export function getPasswordResetTemplate(
    resetUrl: string,
    user: TemplateUser,
    appName: string = "FireCMS"
): { subject: string; html: string; text: string } {
    const greeting = getGreeting(user);

    const subject = `Reset your ${appName} password`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
    <div style="${styles.container}">
        <div style="${styles.card}">
            <h1 style="${styles.heading}">Reset Your Password</h1>
            
            <p style="${styles.paragraph}">
                Hi ${greeting},
            </p>
            
            <p style="${styles.paragraph}">
                We received a request to reset your password for your ${appName} account. 
                Click the button below to create a new password:
            </p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" style="${styles.button}">Reset Password</a>
            </div>
            
            <p style="${styles.paragraph}">
                Or copy and paste this link into your browser:
            </p>
            <p style="color: #3b82f6; word-break: break-all; font-size: 14px;">
                ${resetUrl}
            </p>
            
            <div style="${styles.warning}">
                ⏰ This link will expire in 1 hour for security reasons.
            </div>
            
            <div style="${styles.footer}">
                <p style="margin: 0;">
                    If you didn't request a password reset, you can safely ignore this email. 
                    Your password will remain unchanged.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();

    const text = `
Reset Your Password

Hi ${greeting},

We received a request to reset your password for your ${appName} account.

Click this link to create a new password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email.
Your password will remain unchanged.
    `.trim();

    return { subject, html, text };
}

/**
 * Default email verification template
 */
export function getEmailVerificationTemplate(
    verifyUrl: string,
    user: TemplateUser,
    appName: string = "FireCMS"
): { subject: string; html: string; text: string } {
    const greeting = getGreeting(user);

    const subject = `Verify your ${appName} email address`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
    <div style="${styles.container}">
        <div style="${styles.card}">
            <h1 style="${styles.heading}">Verify Your Email</h1>
            
            <p style="${styles.paragraph}">
                Hi ${greeting},
            </p>
            
            <p style="${styles.paragraph}">
                Thanks for signing up for ${appName}! Please verify your email address 
                by clicking the button below:
            </p>
            
            <div style="text-align: center;">
                <a href="${verifyUrl}" style="${styles.button}">Verify Email Address</a>
            </div>
            
            <p style="${styles.paragraph}">
                Or copy and paste this link into your browser:
            </p>
            <p style="color: #3b82f6; word-break: break-all; font-size: 14px;">
                ${verifyUrl}
            </p>
            
            <div style="${styles.footer}">
                <p style="margin: 0;">
                    If you didn't create an account with ${appName}, you can safely ignore this email.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();

    const text = `
Verify Your Email

Hi ${greeting},

Thanks for signing up for ${appName}! Please verify your email address by clicking this link:
${verifyUrl}

If you didn't create an account with ${appName}, you can safely ignore this email.
    `.trim();

    return { subject, html, text };
}
