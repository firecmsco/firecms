import { FireCMSBackend } from "@firecms/cloud";
import { CenteredView, LocalHospitalIcon, Typography } from "@firecms/ui";
import React from "react";
import { ExistingProjectsTable } from "../components/ExistingProjectsTable";
import { AdminPermissionsRequiredView } from "../components/project_creation/AdminPermissionsRequiredView";
import { useSaasAnalytics } from "../components/SaasAnalyticsProvider";

export function FireCMSDoctorListPage({
                                          fireCMSBackend,
                                          goToDoctor
                                      }: {
    fireCMSBackend: FireCMSBackend,
    goToDoctor: (projectId: string) => void;
}) {

    const analytics = useSaasAnalytics();

    if (!fireCMSBackend.googleCredential?.accessToken) {
        return <AdminPermissionsRequiredView fireCMSBackend={fireCMSBackend}/>
    }

    return <CenteredView maxWidth={"lg"}>

        <div className="flex flex-col space-y-3 p-2">
            <div className="flex flex-row items-center gap-4">

                <LocalHospitalIcon/>

                <Typography variant={"h4"}
                            className="flex-grow">
                    FireCMS Doctor
                </Typography>

            </div>

            <Typography
                className="flex-grow">
                Use this tool to verify that your Firebase project is correctly
                configured to be used with FireCMS, and to activate the features you need.
            </Typography>

            <ExistingProjectsTable
                fireCMSBackend={fireCMSBackend}
                onProjectClick={(project) => {
                    analytics.logDoctorScreenProjectSelected(project.projectId);
                    goToDoctor(project.projectId);
                }}/>

        </div>
    </CenteredView>;

}
