import { Collapse, ForumIcon, Label, Typography } from "@firecms/ui";
import { useNavigate } from "react-router";
import { useCollectionRegistryController, useCMSUrlController } from "@firecms/core";

export function DataTalkSuggestions({
    suggestions,
    onAnalyticsEvent
}: {
    suggestions?: string[],
    onAnalyticsEvent?: (event: string, data?: object) => void;

}) {
    const navigate = useNavigate();
    const collectionRegistry = useCollectionRegistryController();
    const cmsUrlController = useCMSUrlController();
    const hasCollections = (collectionRegistry.collections ?? []).length > 0;

    return <Collapse in={(suggestions ?? []).length > 0 && hasCollections} className={"mt-4"}>

        <Typography variant={"body2"} color={"secondary"} className={"ml-2 flex items-center gap-2"}>
            <ForumIcon size="smallest" /> Query and update your data in natural language with <b>DATATALK</b>
        </Typography>

        <div className={"flex flex-row gap-2 my-4"}>
            {suggestions && suggestions.map((suggestion, index) => {
                return <Label
                    className={"flex-1"}
                    border={true}
                    onClick={() => {
                        onAnalyticsEvent?.("datatalk:home_suggestion_clicked", {
                            suggestion
                        });
                        return navigate(cmsUrlController.homeUrl + "/datatalk?prompt=" + suggestion);
                    }}
                    key={index}>{suggestion}</Label>
            })}
        </div>
    </Collapse>;
}
