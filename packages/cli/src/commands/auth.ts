/**
 * CLI command: rebase auth <action>
 *
 * Subcommands:
 *   reset-password — Reset a user's password
 */
import arg from "arg";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import {
    requireProjectRoot,
    requireBackendDir,
    findEnvFile,
    resolveTsx,
} from "../utils/project";

export async function authCommand(subcommand: string | undefined, rawArgs: string[]): Promise<void> {
    if (!subcommand || subcommand === "--help") {
        printAuthHelp();
        return;
    }

    switch (subcommand) {
        case "reset-password":
            await resetPassword(rawArgs);
            break;
        default:
            console.error(chalk.red(`Unknown auth command: ${subcommand}`));
            console.log("");
            printAuthHelp();
            process.exit(1);
    }
}

async function resetPassword(rawArgs: string[]): Promise<void> {
    const args = arg(
        {
            "--email": String,
            "--password": String,
            "-e": "--email",
            "-p": "--password",
        },
        {
            argv: rawArgs.slice(4), // skip "node rebase auth reset-password"
            permissive: true,
        }
    );

    // Support both --email flag and positional args
    const email = args["--email"] || args._[0];
    const newPassword = args["--password"] || args._[1];

    if (!email) {
        console.error(chalk.red("✗ Email is required."));
        console.log("");
        console.log(chalk.gray("  Usage: rebase auth reset-password <email> [new-password]"));
        console.log(chalk.gray("         rebase auth reset-password --email user@example.com --password NewPass123!"));
        process.exit(1);
    }

    const projectRoot = requireProjectRoot();
    const backendDir = requireBackendDir(projectRoot);
    const tsxBin = resolveTsx(projectRoot);

    if (!tsxBin) {
        console.error(chalk.red("✗ Could not find tsx binary."));
        process.exit(1);
    }

    // Create a temporary script that performs the password reset
    const envFile = findEnvFile(projectRoot);
    const env: Record<string, string> = { ...process.env as Record<string, string> };
    if (envFile) {
        env.DOTENV_CONFIG_PATH = envFile;
    }

    const scriptContent = `
import { createPostgresDatabaseConnection } from "@rebasepro/server-core";
import { hashPassword } from "@rebasepro/server-core/src/auth/password";
import { eq } from "drizzle-orm";
import { users } from "@rebasepro/server-core/src/db/auth-schema";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: "${envFile || path.join(projectRoot, ".env")}" });

const email = "${email}";
const newPassword = "${newPassword || "NewPassword123!"}";

async function resetPassword() {
    const { db } = createPostgresDatabaseConnection(process.env.DATABASE_URL!);
    const hash = await hashPassword(newPassword);

    const result = await db.update(users)
        .set({ passwordHash: hash })
        .where(eq(users.email, email))
        .returning({
            id: users.id,
            email: users.email
        });

    if (result.length > 0) {
        console.log("✅ Password reset for: " + result[0].email);
        ${!newPassword ? 'console.log("   New password: " + newPassword);' : ""}
    } else {
        console.log("✗ User not found: " + email);
    }
    process.exit(0);
}

resetPassword().catch(console.error);
`;

    const tmpScriptPath = path.join(backendDir, ".tmp-reset-password.ts");
    fs.writeFileSync(tmpScriptPath, scriptContent, "utf-8");

    console.log("");
    console.log(chalk.bold("  🔑 Rebase Auth — Reset Password"));
    console.log("");
    console.log(`  ${chalk.gray("Email:")} ${email}`);
    if (newPassword) {
        console.log(`  ${chalk.gray("Password:")} ${"*".repeat(newPassword.length)}`);
    }
    console.log("");

    const child = spawn(tsxBin, [tmpScriptPath], {
        cwd: backendDir,
        stdio: "inherit",
        env,
    });

    return new Promise((resolve) => {
        child.on("close", (code) => {
            // Clean up temp script
            try { fs.unlinkSync(tmpScriptPath); } catch { /* ignore */ }
            if (code !== 0) {
                process.exit(code ?? 1);
            }
            resolve();
        });
    });
}

function printAuthHelp() {
    console.log(`
${chalk.bold("rebase auth")} — Authentication management commands

${chalk.green.bold("Usage")}
  rebase auth ${chalk.blue("<command>")} [options]

${chalk.green.bold("Commands")}
  ${chalk.blue.bold("reset-password")}    Reset a user's password

${chalk.green.bold("reset-password Options")}
  ${chalk.blue("--email, -e")}        User's email address
  ${chalk.blue("--password, -p")}     New password (default: NewPassword123!)

${chalk.green.bold("Examples")}
  rebase auth reset-password user@example.com
  rebase auth reset-password --email user@example.com --password MyNewPass!
`);
}
