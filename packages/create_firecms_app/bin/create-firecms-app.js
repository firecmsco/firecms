#!/usr/bin/env node
(async () => {
    const fireCMS = await import("@firecms/cli");
    fireCMS.createFireCMSApp(process.argv);
})();


// import { createFireCMSApp } from "@firecms/cli";
//
// createFireCMSApp(process.argv);

// require = require('esm')(module /*, options*/);
// require("@firecms/cli").createFireCMSApp(process.argv);

