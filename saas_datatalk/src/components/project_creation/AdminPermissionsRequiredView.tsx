import { CenteredView, Typography } from "@firecms/ui";
import { FireCMSBackend, FireCMSCloudLoginView } from "@firecms/cloud";
import { useEffect } from "react";
import { useSaasAnalytics } from "../SaasAnalyticsProvider";

export function AdminPermissionsRequiredView({ fireCMSBackend, projectId }: { fireCMSBackend: FireCMSBackend, projectId?: string }) {

    const analytics = useSaasAnalytics();
    useEffect(() => {
        analytics.logAdminPermissionsRequired(projectId);
    }, []);
    return <CenteredView maxWidth={"xl"}>
        <div className="flex flex-col space-y-2 p-2">
            <Typography variant={"h4"}
                        className="text-center flex-grow">
                Permissions required
            </Typography>
            <Typography
                className="text-center flex-grow">
                FireCMS projects use your <b>Firebase project</b> as a backend.
                In order to create and manage projects, we need permissions to
                create and manage Firebase projects on your behalf.
            </Typography>
            <FireCMSCloudLoginView fireCMSBackend={fireCMSBackend}
                                   includeGoogleAdminScopes={true}
                                   includeLogo={false}
                                   includeGoogleDisclosure={true}
                                   includeTermsAndNewsLetter={false}/>
        </div>
    </CenteredView>;
}
