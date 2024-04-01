#!/usr/bin/env node
(async () => {
  const fireCMS = await import("@firecms/cli");
  fireCMS.createFireCMSApp(process.argv);
})();
