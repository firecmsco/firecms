import { CenteredView, Paper } from "@firecms/ui";
import { FireCMSBackend, FireCMSCloudLoginView } from "@firecms/cloud";
import { useEffect, useState } from "react";
import { ProjectsSelect } from "../components/ProjectsSelect";

export function SassDebugView({
                                  selectProject,
                                  fireCMSBackend,
                                  selectedProjectId,
                                  onNewProject
                              }: {
    selectProject: (projectId?: string) => void;
    fireCMSBackend: FireCMSBackend;
    selectedProjectId?: string;
    onNewProject: () => void;
}) {

    const [firebaseIdToken, setFirebaseIdToken] = useState<string | undefined>(undefined);

    useEffect(() => {
        fireCMSBackend.getBackendAuthToken().then(setFirebaseIdToken);
    }, [fireCMSBackend]);

    return <CenteredView>

        <Paper>
            <div>Firebase credential:</div>
            <pre
                className="max-w-[500px] overflow-auto">
                {JSON.stringify(firebaseIdToken ?? "", null, 2)}
            </pre>
            <div>Google credential:</div>
            <pre
                className="max-w-[500px] overflow-auto">
                {JSON.stringify(fireCMSBackend.googleCredential, null, 2)}
            </pre>
            <ProjectsSelect/>
            <FireCMSCloudLoginView fireCMSBackend={fireCMSBackend}
                                   includeLogo={true}
                                   includeGoogleDisclosure={false}
                                   includeGoogleAdminScopes={true}
                                   includeTermsAndNewsLetter={false}/>
        </Paper>
    </CenteredView>;
}
