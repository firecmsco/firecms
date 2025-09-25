// plugins/docusaurus-plugin-inline-css/index.js
const path = require("path");
const { spawn } = require("child_process");

module.exports = function (_context, _options) {
  return {
    name: "docusaurus-plugin-inline-css",
    async postBuild({ outDir }) {
      const runnerPath = path.join(__dirname, "runner.mjs");
      console.log(`Inline CSS plugin: starting runner for ${outDir}`);

      await new Promise((resolve) => {
        const child = spawn(process.execPath, [runnerPath, outDir], {
          stdio: "inherit",
          env: process.env,
        });
        child.on("close", (code) => {
          if (code === 0) {
            console.log("✅ Inline CSS plugin: Completed inlining across HTML files.");
          } else {
            console.warn(`⚠️ Inline CSS plugin: Runner exited with code ${code}. Build will continue.`);
          }
          resolve();
        });
        child.on("error", (err) => {
          console.warn("⚠️ Inline CSS plugin: Failed to start runner:", err?.message || err);
          resolve();
        });
      });
    },
  };
};

