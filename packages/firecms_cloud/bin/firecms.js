#!/usr/bin/env node
(async () => {
    const fireCMS = await import("firecms");
    fireCMS.entry(process.argv);
})();
