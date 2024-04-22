import { Button, CenteredView, LoadingButton, Typography } from "@firecms/ui";
import { useState } from "react";
import { ApiError, CloudErrorView, FireCMSBackend, SecurityRulesInstructions, useFireCMSBackend } from "@firecms/cloud";
import { AdminPermissionsRequiredView } from "./AdminPermissionsRequiredView";
import { ServiceAccount } from "../../types/service_account";

export function SecurityRulesConfigView({
                                            onRulesReady,
                                            fireCMSBackend,
                                            projectId,
                                            serviceAccount
                                        }: {
    onRulesReady: () => void;
    projectId: string;
    fireCMSBackend: FireCMSBackend;
    serviceAccount?: ServiceAccount,
}) {

    const { projectsApi } = useFireCMSBackend();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | undefined>();

    const onCreateRules = async () => {
        setLoading(true);
        const googleAccessToken = fireCMSBackend.googleCredential?.accessToken;
        if (!googleAccessToken && !serviceAccount) {
            throw new Error("SecurityRulesConfigView: Google credential not found");
        }
        projectsApi.addSecurityRules(projectId, googleAccessToken, serviceAccount).then(() => {
            onRulesReady();
        }).catch(setError).finally(() => setLoading(false));
        onRulesReady();

    };

    if (!fireCMSBackend.googleCredential && !serviceAccount) {
        return <AdminPermissionsRequiredView fireCMSBackend={fireCMSBackend}
                                             projectId={projectId}/>
    }

    return <CenteredView maxWidth={"2xl"} className={"flex flex-col space-y-2"}>

        <SecurityRulesInstructions/>

        <Typography>
            In order to secure your database and make sure that only
            FireCMS users can read and write your data, this security rule
            will be added to your config.
        </Typography>

        <Typography>
            This is done <strong>automatically</strong>.
        </Typography>

        {error &&
            <CloudErrorView error={error} fireCMSBackend={fireCMSBackend}/>}

        <div
            className="py-1 px-2 flex flex-row items-center justify-end sticky bottom-0 right-0 left-0 text-right mt-2">
            <Button variant={"text"}
                    onClick={() => onRulesReady()}>Omit</Button>
            <LoadingButton variant={"filled"}
                           loading={loading}
                           onClick={onCreateRules}>
                Create rules
            </LoadingButton>
        </div>
    </CenteredView>
}
