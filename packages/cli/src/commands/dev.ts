/**
 * CLI command: rebase dev
 *
 * Starts the full development environment:
 * - Backend: tsx watch with auto-reload
 * - Frontend: vite dev server
 *
 * Both processes stream output with color-coded prefixes.
 */
import arg from "arg";
import chalk from "chalk";
import execa, { ExecaChildProcess } from "execa";
import path from "path";
import {
    requireProjectRoot,
    findBackendDir,
    findFrontendDir,
    findEnvFile,
    resolveTsx,
} from "../utils/project";

export async function devCommand(rawArgs: string[]): Promise<void> {
    const args = arg(
        {
            "--backend-only": Boolean,
            "--frontend-only": Boolean,
            "--port": Number,
            "--help": Boolean,
            "-b": "--backend-only",
            "-f": "--frontend-only",
            "-p": "--port",
            "-h": "--help",
        },
        {
            argv: rawArgs.slice(3), // skip "node rebase dev"
            permissive: true,
        }
    );

    if (args["--help"]) {
        printDevHelp();
        return;
    }

    const projectRoot = requireProjectRoot();
    const backendDir = findBackendDir(projectRoot);
    const frontendDir = findFrontendDir(projectRoot);
    const backendOnly = args["--backend-only"] || false;
    const frontendOnly = args["--frontend-only"] || false;

    console.log("");
    console.log(chalk.bold("  🚀 Rebase Dev Server"));
    console.log("");

    const children: ExecaChildProcess[] = [];

    // --- State for printing the banner ---
    let frontendUrl = "";
    let backendUrl = "";
    let debounceSummary: NodeJS.Timeout | null = null;
    let bannerPrinted = false;

    // Use regex to strip ANSI codes before matching
    const stripAnsi = (str: string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

    function printSummary() {
        if (!frontendUrl || !backendUrl) return;
        if (debounceSummary) clearTimeout(debounceSummary);
        debounceSummary = setTimeout(() => {
            if (bannerPrinted) return;
            console.log("");
            console.log(chalk.cyan("┌────────────────────────────────────────────────────────────┐"));
            console.log(chalk.cyan("│                                                            │"));
            console.log(chalk.cyan("│   ✨ Rebase Admin App is ready!                            │"));
            const cleanUrl = stripAnsi(frontendUrl);
            const paddedUrl = cleanUrl.padEnd(40);
            console.log(chalk.cyan(`│   👉 Frontend URL: `) + chalk.white(paddedUrl) + chalk.cyan(`│`));
            console.log(chalk.cyan("│                                                            │"));
            console.log(chalk.cyan("└────────────────────────────────────────────────────────────┘"));
            console.log("");
            bannerPrinted = true;
        }, 500);
    }

    // Handle graceful shutdown
    const cleanup = () => {
        children.forEach((child) => {
            if (!child.killed) {
                child.kill("SIGTERM");
            }
        });
        process.exit(0);
    };
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    // Start backend
    if (!frontendOnly && backendDir) {
        const tsxBin = resolveTsx(projectRoot);
        if (!tsxBin) {
            console.error(chalk.red("  ✗ Could not find tsx binary for backend."));
            console.error(chalk.gray("    Install it with: pnpm add -D tsx"));
            process.exit(1);
        }

        const envFile = findEnvFile(projectRoot);
        const env: Record<string, string> = { ...process.env as Record<string, string> };
        if (envFile) {
            env.DOTENV_CONFIG_PATH = envFile;
        }
        if (args["--port"]) {
            env.PORT = String(args["--port"]);
        }

        // Check for backend entry point
        const backendEntry = path.join(backendDir, "src", "index.ts");
        const watchDirs = [
            `--watch="${path.join("..", "shared", "**", "*")}"`,
        ];

        console.log(`  ${chalk.cyan("▶")} Backend:  ${chalk.gray(backendDir)}`);

        const backendChild = execa(
            tsxBin,
            ["watch", ...watchDirs, "--conditions", "development", "src/index.ts"],
            {
                cwd: backendDir,
                stdio: ["inherit", "pipe", "pipe"],
                env,
                shell: true,
            }
        );
        backendChild.catch(() => {}); // prevent unhandled promise rejection on exit

        backendChild.stdout?.on("data", (data: Buffer) => {
            const lines = data.toString().split("\n").filter(Boolean);
            lines.forEach((line: string) => {
                console.log(`${chalk.cyan.bold("[backend]")}  ${line}`);
                const cleanLine = stripAnsi(line);
                if (cleanLine.includes("Server running at http://")) {
                    backendUrl = "started";
                    printSummary();
                }
            });
        });

        backendChild.stderr?.on("data", (data: Buffer) => {
            const lines = data.toString().split("\n").filter(Boolean);
            lines.forEach((line: string) => {
                console.log(`${chalk.cyan.bold("[backend]")}  ${line}`);
            });
        });

        children.push(backendChild);
    } else if (!frontendOnly && !backendDir) {
        console.warn(chalk.yellow("  ⚠ No backend/ directory found, skipping backend."));
    }

    // Start frontend
    if (!backendOnly && frontendDir) {
        console.log(`  ${chalk.magenta("▶")} Frontend: ${chalk.gray(frontendDir)}`);

        const frontendChild = execa(
            "pnpm",
            ["run", "dev"],
            {
                cwd: frontendDir,
                stdio: ["inherit", "pipe", "pipe"],
                env: process.env as Record<string, string>,
                shell: true,
            }
        );
        frontendChild.catch(() => {}); // prevent unhandled promise rejection on exit

        frontendChild.stdout?.on("data", (data: Buffer) => {
            const lines = data.toString().split("\n").filter(Boolean);
            lines.forEach((line: string) => {
                console.log(`${chalk.magenta.bold("[frontend]")} ${line}`);
                const cleanLine = stripAnsi(line);
                const urlMatch = cleanLine.match(/(http:\/\/(?:localhost|127\.0\.0\.1):\d+)/);
                if (cleanLine.includes("Local:") && urlMatch) {
                    frontendUrl = urlMatch[1];
                    printSummary();
                }
            });
        });

        frontendChild.stderr?.on("data", (data: Buffer) => {
            const lines = data.toString().split("\n").filter(Boolean);
            lines.forEach((line: string) => {
                console.log(`${chalk.magenta.bold("[frontend]")} ${line}`);
            });
        });

        children.push(frontendChild);
    } else if (!backendOnly && !frontendDir) {
        console.warn(chalk.yellow("  ⚠ No frontend/ directory found, skipping frontend."));
    }

    if (children.length === 0) {
        console.error(chalk.red("  ✗ Nothing to start. Check your project structure."));
        process.exit(1);
    }

    console.log("");
    console.log(chalk.gray("  Press Ctrl+C to stop all servers."));
    console.log("");

    // Wait for all children to exit
    await Promise.all(
        children.map(
            (child) =>
                new Promise<void>((resolve) => {
                    child.finally(() => resolve());
                })
        )
    );
}

function printDevHelp() {
    console.log(`
${chalk.bold("rebase dev")} — Start the development server

${chalk.green.bold("Usage")}
  rebase dev [options]

${chalk.green.bold("Options")}
  ${chalk.blue("--backend-only, -b")}   Only start the backend server
  ${chalk.blue("--frontend-only, -f")}  Only start the frontend server
  ${chalk.blue("--port, -p")}           Backend port (default: 3001)

${chalk.green.bold("Description")}
  Starts both the backend (tsx watch + Express) and frontend (Vite)
  dev servers concurrently with color-coded output prefixes.
`);
}
