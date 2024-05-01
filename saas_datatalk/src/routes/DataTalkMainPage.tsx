import { useEffect, useState } from "react";

import { CircularProgressCenter, FireCMSLogo } from "@firecms/core";
import { Alert, Button, CenteredView, FavoriteIcon, Typography } from "@firecms/ui";
import { FireCMSBackend } from "@firecms/cloud";
import { useSaasAnalytics } from "../components/SaasAnalyticsProvider";
import { getRecentProject } from "../utils/recent_projects_prefs";
import { FirebaseLogo } from "../components/utils/logos/FirebaseLogo";

export function DataTalkMainPage({
                                 selectProject,
                                 fireCMSBackend,
                                 goToSettings,
                                 onNewProject,
                                 redirectToProject = true
                             }: {
    selectProject: (projectId?: string) => void;
    fireCMSBackend: FireCMSBackend;
    onNewProject: () => void;
    goToSettings: () => void;
    redirectToProject: boolean
}) {

    const analytics = useSaasAnalytics();
    const [projectRedirectionChecked, setProjectRedirectionChecked] = useState(false);

    const {
        availableProjectIds,
        availableProjectsLoaded
    } = fireCMSBackend;

    useEffect(() => {
        // goToSettings();
        if (availableProjectsLoaded && (availableProjectIds === undefined || availableProjectIds.length === 0)) {
            setProjectRedirectionChecked(true);
            return;
        }
        if (redirectToProject && availableProjectIds && fireCMSBackend.backendUid) {
            const recentProject = getRecentProject(fireCMSBackend.backendUid);
            if (recentProject && availableProjectIds?.includes(recentProject)) {
                selectProject(recentProject);
            } else {
                if (availableProjectIds.length > 0) {
                    selectProject(availableProjectIds[0]);
                } else {
                    onNewProject();
                }
            }
        } else if (!redirectToProject) {
            setProjectRedirectionChecked(true);
        }
    }, [availableProjectIds, availableProjectsLoaded, onNewProject, redirectToProject, selectProject, fireCMSBackend.backendUid]);

    if (!availableProjectsLoaded || !projectRedirectionChecked) {
        return <CircularProgressCenter/>
    }

    return <CenteredView maxWidth={"2xl"}>
        <div className="flex flex-col gap-4 p-2">

            <Alert color="success">
                <b>FireCMS Cloud</b> is currently in <b>beta</b>. Please report any issues
                you find to the <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://github.com/firecmsco/firecms">Github repository</a>.
            </Alert>

            <div className="flex flex-row items-center space-x-1 font-bold px-2">
                <FirebaseLogo width={"96px"} height={"96px"} style={{ padding: "10px" }}/>
                +
                <FireCMSLogo width={"96px"} height={"96px"} style={{ padding: "10px" }}/>
                =
                <FavoriteIcon
                    size={96}
                    style={{
                        padding: "10px"
                    }}
                    className="text-red-500"/>
            </div>

            <Typography variant={"h4"}
                        className="flex-grow">
                Welcome to DataTalk
            </Typography>

            <Typography
                className="flex-grow mt-2">
                FireCMS Cloud allows you to create and manage your FireCMS
                projects related
                to your Google Cloud projects in one single space. No need to
                code and deploy.
            </Typography>

            <Typography>
                You will be requested
                to grant some <b>Google Cloud permissions</b> to FireCMS, in order to
                create the necessary resources for your project.
            </Typography>

            <Button className={"w-full mt-4"}
                    size={"large"}
                    variant="filled"
                    onClick={() => {
                        analytics.logMainScreenNewProject();
                        onNewProject();
                    }}>
                Create your first project 🚀
            </Button>

            <Typography className={"mt-4"}>If you are using FireCMS in the self-hosted mode, you can
                access self-hosted subscriptions here
            </Typography>
            <Button className={"w-full"}
                    variant="text"
                    size={"small"}
                    onClick={() => {
                        analytics.logMainScreenSubscriptions();
                        goToSettings();
                    }}>
                Manage self-hosted subscriptions
            </Button>
        </div>
    </CenteredView>;
}
