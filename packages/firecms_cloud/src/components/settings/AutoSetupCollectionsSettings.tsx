import { useFireCMSBackend, useProjectConfig } from "../../hooks";
import { Typography } from "@firecms/ui";
import { AutoSetUpCollectionsButton } from "../AutoSetUpCollectionsButton";

export function AutoSetupCollectionsSettings() {

    const { projectsApi } = useFireCMSBackend();
    const projectConfig = useProjectConfig();

    return <div className={"flex flex-col gap-2"}>
        <Typography variant={"h4"} className="mt-4 mb-2">Auto setup collections</Typography>
        <Typography variant={"body1"}>WARNING: When you click this button </Typography>
        <AutoSetUpCollectionsButton projectsApi={projectsApi}
                                    projectId={projectConfig.projectId}
                                    askConfirmation={true}
        />
    </div>;
}
