#!/usr/bin/env node
(async () => {
    const fireCMS = await import("@firecms/cli");
    fireCMS.entry(process.argv);
})();
