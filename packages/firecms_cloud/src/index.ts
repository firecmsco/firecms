export * from "./hooks";
export * from "./components";
export * from "./types";
export * from "./utils";

export * from "./api/projects";

// The app components come from the lazy wrappers, not the implementation: a
// static re-export here pulls the whole CMS — collection editor, importers,
// DataTalk, entity history, Firestore admin — in front of the login screen.
// The types still come straight from the implementation and cost nothing.
export { FireCMSCloudApp, FireCMSClient, FireCMSClientWithController } from "./lazy_cloud_app";
// Only reaches @firecms/core, so it stays on the eager side of the split above.
// A host that renders its own loading states for a project uses this to render
// the same chrome the CMS will, and the top bar then survives the handover.
export * from "./ProjectLoadingShell";
export type { FireCMSClientProps } from "./FireCMSCloudApp";
export type { FireCMSCloudAppProps } from "./FireCMSCloudAppProps";

// we export everything in these packages for simplicity
export * from "@firecms/firebase";
export * from "@firecms/ui";
export * from "@firecms/core";
