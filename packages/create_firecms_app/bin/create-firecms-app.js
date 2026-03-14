#!/usr/bin/env node
(async () => {
    const rebase = await import("@rebasepro/cli");
    rebase.createRebaseApp(process.argv);
})();
