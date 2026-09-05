import React from "react";
import { AppBar, CircularProgressCenter, DefaultAppBarProps, Scaffold } from "@firecms/core";

export type ProjectLoadingShellProps = {

    /**
     * Used as the Scaffold key, so that a project switch is a remount rather
     * than an update of the previous project's chrome.
     */
    projectId?: string;

    title?: string;

    logo?: string;

    FireCMSAppBarComponent?: React.ComponentType<DefaultAppBarProps<any>>;

    /**
     * Extra props forwarded to the app bar component, matching what the CMS
     * passes it once it is up.
     */
    appBarProps?: object;

    /**
     * Caption under the spinner. Ignored when `children` is given.
     */
    text?: string;

    /**
     * Body of the scaffold. Defaults to a centered spinner; error views pass
     * their own so that they too keep the top bar.
     */
    children?: React.ReactNode;
};

/**
 * The chrome of a project view: the same Scaffold and app bar the CMS renders
 * once it is up, around whatever is standing in for the project.
 *
 * Loading a project passes through several phases — the CMS chunk arriving, the
 * project config, user management, the delegated login — and each one used to
 * build its own Scaffold and AppBar. React tears the bar down and rebuilds it
 * between them, which is invisible only for as long as every phase renders the
 * same thing. They did not: the app bar came and went, and the mode toggle, the
 * language toggle and the avatar slid sideways with it. Rendering every phase
 * through this one component is what keeps those remounts from showing.
 *
 * It lives in its own module, rather than in `FireCMSCloudApp`, so that
 * `lazy_cloud_app` can use it as the Suspense fallback of the CMS chunk without
 * importing the chunk it is waiting for.
 */
export function ProjectLoadingShell({
                                        projectId,
                                        title,
                                        logo,
                                        FireCMSAppBarComponent,
                                        appBarProps,
                                        text,
                                        children
                                    }: ProjectLoadingShellProps) {
    return <Scaffold
        key={"project_scaffold_" + projectId}
        logo={logo}>
        <AppBar logo={logo}>
            {FireCMSAppBarComponent &&
                <FireCMSAppBarComponent title={title ?? ""}
                                        {...appBarProps} />}
        </AppBar>
        {children ?? <CircularProgressCenter text={text} />}
    </Scaffold>;
}
