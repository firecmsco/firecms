export * from "./hooks/index.js";
export * from "./components/index.js";
export * from "./types/index.js";
export * from "./utils/index.js";

export * from "./api/projects.js";

// The app components come from the lazy wrappers, not the implementation: a
// static re-export here pulls the whole CMS — collection editor, importers,
// DataTalk, entity history, Firestore admin — in front of the login screen.
// The types still come straight from the implementation and cost nothing.
export { FireCMSCloudApp, FireCMSClient, FireCMSClientWithController } from "./lazy_cloud_app.js";
// Only reaches @firecms/core, so it stays on the eager side of the split above.
// A host that renders its own loading states for a project uses this to render
// the same chrome the CMS will, and the top bar then survives the handover.
export * from "./ProjectLoadingShell.js";
export type { FireCMSClientProps } from "./FireCMSCloudApp.js";
export type { FireCMSCloudAppProps } from "./FireCMSCloudAppProps.js";

// we export everything in these packages for simplicity
export * from "@firecms/firebase";
export * from "@firecms/ui";
export * from "@firecms/core";
