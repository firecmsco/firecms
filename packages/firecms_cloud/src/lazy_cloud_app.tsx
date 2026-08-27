import React from "react";
import { CircularProgressCenter } from "@firecms/core";

import type { FireCMSCloudAppProps } from "./FireCMSCloudAppProps";
import type { FireCMSClientProps } from "./FireCMSCloudApp";
import type { CloudUserManagement, ProjectConfig } from "./hooks";

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
 */
const load = () => import("./FireCMSCloudApp");

const LazyFireCMSCloudApp = React.lazy(() =>
    load().then((module) => ({ default: module.FireCMSCloudApp })));
const LazyFireCMSClient = React.lazy(() =>
    load().then((module) => ({ default: module.FireCMSClient })));
const LazyFireCMSClientWithController = React.lazy(() =>
    load().then((module) => ({ default: module.FireCMSClientWithController })));

export function FireCMSCloudApp(props: FireCMSCloudAppProps) {
    return (
        <React.Suspense fallback={<CircularProgressCenter/>}>
            <LazyFireCMSCloudApp {...props}/>
        </React.Suspense>
    );
}

export function FireCMSClient<ExtraAppbarProps = object>(props: FireCMSClientProps<ExtraAppbarProps>) {
    return (
        <React.Suspense fallback={<CircularProgressCenter/>}>
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
        <React.Suspense fallback={<CircularProgressCenter/>}>
            <LazyFireCMSClientWithController {...props}/>
        </React.Suspense>
    );
}
