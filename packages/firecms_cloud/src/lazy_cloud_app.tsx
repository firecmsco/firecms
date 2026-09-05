import React from "react";
import { CircularProgressCenter, lazyEager } from "@firecms/core";

import type { FireCMSCloudAppProps } from "./FireCMSCloudAppProps";
import type { FireCMSClientProps } from "./FireCMSCloudApp";
import type { CloudUserManagement, ProjectConfig } from "./hooks";
import { ProjectLoadingShell } from "./ProjectLoadingShell";

/**
 * The three app-level components of this package, loaded on demand.
 *
 * `FireCMSCloudApp.tsx` is where every heavy dependency of the CMS proper meets:
 * the collection editor and its Firestore controller, data import and export,
 * data enhancement, DataTalk, entity history, the Firestore admin views and user
 * management. A static re-export from the package barrel put all of it in front
 * of the login screen, which needs none of it — a sign-in form was waiting on
 * the spreadsheet importer.
 *
 * Splitting it here keeps the barrel's exports exactly as they were. Each
 * wrapper carries its own Suspense boundary and the same loading indicator the
 * components already render while they resolve a project, so a consumer sees no
 * difference beyond the module arriving a moment later.
 *
 * Two things make "a moment later" invisible rather than a flash. The module is
 * prefetched once the page is idle, through the same `lazyEager` every other
 * split point in the codebase uses — a plain `React.lazy` here meant the chunk
 * was only requested when someone opened a project, and the top bar went blank
 * for as long as it took to arrive. And the fallback is the project chrome, not
 * a bare spinner, so the bar stays on screen while it does.
 */
let modulePromise: Promise<typeof import("./FireCMSCloudApp")> | null = null;
const load = () => (modulePromise ??= import("./FireCMSCloudApp"));

const LazyFireCMSCloudApp = lazyEager<typeof import("./FireCMSCloudApp")["FireCMSCloudApp"]>(load, "FireCMSCloudApp");
const LazyFireCMSClient = lazyEager<typeof import("./FireCMSCloudApp")["FireCMSClient"]>(load, "FireCMSClient");
const LazyFireCMSClientWithController = lazyEager<typeof import("./FireCMSCloudApp")["FireCMSClientWithController"]>(load, "FireCMSClientWithController");

/**
 * This one keeps the bare spinner: it is the component that mounts the Router,
 * so its fallback renders outside it, and the app bar links would throw there.
 */
export function FireCMSCloudApp(props: FireCMSCloudAppProps) {
    return (
        <React.Suspense fallback={<CircularProgressCenter/>}>
            <LazyFireCMSCloudApp {...props}/>
        </React.Suspense>
    );
}

export function FireCMSClient<ExtraAppbarProps = object>(props: FireCMSClientProps<ExtraAppbarProps>) {
    return (
        <React.Suspense fallback={<ProjectLoadingShell
            projectId={props.projectId}
            FireCMSAppBarComponent={props.FireCMSAppBarComponent as React.ComponentType<any>}
            appBarProps={props.appConfig?.fireCMSAppBarComponentProps}/>}>
            <LazyFireCMSClient {...(props as FireCMSClientProps)}/>
        </React.Suspense>
    );
}

export function FireCMSClientWithController(props: FireCMSClientProps & {
    logo?: string;
    userManagement: CloudUserManagement;
    projectConfig: ProjectConfig;
    projectId: string;
    customizationLoading: boolean;
}) {
    return (
        <React.Suspense fallback={<ProjectLoadingShell
            projectId={props.projectConfig.projectId}
            title={props.projectConfig.projectName ?? ""}
            logo={props.projectConfig.logo ?? props.logo}
            FireCMSAppBarComponent={props.FireCMSAppBarComponent}
            appBarProps={props.appConfig?.fireCMSAppBarComponentProps}/>}>
            <LazyFireCMSClientWithController {...props}/>
        </React.Suspense>
    );
}
