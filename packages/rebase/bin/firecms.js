#!/usr/bin/env node
(async () => {
  const rebase = await import("@rebasepro/cli");
  rebase.entry(process.argv);
})();
