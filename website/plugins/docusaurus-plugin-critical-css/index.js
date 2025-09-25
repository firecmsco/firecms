// plugins/docusaurus-plugin-critical-css/index.js
const path = require("path");
const { spawn } = require("child_process");

module.exports = function (_context, _options) {
    return {
        name: "docusaurus-plugin-critical-css",
        async postBuild({ outDir }) {
            const runnerPath = path.join(__dirname, "runner.mjs");
            console.log(`CSS Inline plugin: starting runner for ${outDir}`);

            await new Promise((resolve) => {
                const child = spawn(process.execPath, [runnerPath, outDir], {
                    stdio: "inherit",
                    env: process.env,
                });
                child.on("close", (code) => {
                    if (code === 0) {
                        console.log("✅ CSS Inline plugin: Completed inlining across HTML files.");
                    } else {
                        console.warn(`⚠️ CSS Inline plugin: Runner exited with code ${code}. Build will continue.`);
                    }
                    resolve();
                });
                child.on("error", (err) => {
                    console.warn("⚠️ CSS Inline plugin: Failed to start runner:", err?.message || err);
                    resolve();
                });
            });
        },
    };
};
