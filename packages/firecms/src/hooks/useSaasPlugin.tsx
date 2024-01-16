import { FireCMSPlugin } from "@firecms/core";
import { ProjectConfig } from "./useBuildProjectConfig";
import { TextSearchInfoDialog } from "../components/subscriptions/TextSearchInfoDialog";

export function useSaasPlugin({ projectConfig }: {
    projectConfig: ProjectConfig
}): FireCMSPlugin {
    return {
        name: "Saas plugin",
        collectionView: {
            blockTextSearch: !projectConfig.canUseLocalTextSearch || !projectConfig.localTextSearchEnabled,
            onTextSearchClick: projectConfig.canUseLocalTextSearch && projectConfig.localTextSearchEnabled
                ? undefined
                : ({ context }) => {
                    console.log("onTextSearchClick");
                    context.dialogsController.open({
                        key: "text_search_info",
                        Component: TextSearchInfoDialog
                    });
                }
        }
    }
}
