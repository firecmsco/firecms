#!/usr/bin/env node
import { spawn } from "child_process";

// --- Helper Functions ---
const formatTerminalText = (text: string, options: {
    bold?: boolean;
    backgroundColor?: "blue" | "green" | "red" | "yellow" | "cyan" | "magenta";
    textColor?: "white" | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan";
} = {}): string => {
    let codes = "";
    if (options.bold) codes += "\x1b[1m";
    if (options.backgroundColor) {
        const bgColors = {
            blue: "\x1b[44m",
            green: "\x1b[42m",
            red: "\x1b[41m",
            yellow: "\x1b[43m",
            cyan: "\x1b[46m",
            magenta: "\x1b[45m"
        } as const;
        codes += bgColors[options.backgroundColor];
    }
    if (options.textColor) {
        const textColors = {
            white: "\x1b[37m",
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m"
        } as const;
        codes += textColors[options.textColor];
    }
    return `${codes}${text}\x1b[0m`;
};

// Run drizzle-kit generate with the correct env path
const child = spawn("npx", ["drizzle-kit", "generate"], {
    stdio: "inherit",
    env: {
        ...process.env,
        DOTENV_CONFIG_PATH: "../.env"
    },
    shell: true
});

child.on("close", (code) => {
    if (code === 0) {
        console.log("");
        console.log(`You can now run ${formatTerminalText("pnpm db:migrate", {
            bold: true,
            backgroundColor: "green",
            textColor: "black"
        })} to apply the migrations to your database.`);
        console.log("");
    }
    process.exit(code ?? 0);
});
