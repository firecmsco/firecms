import { Collapse, Label } from "@firecms/ui";
import { useNavigate } from "react-router";
import { useNavigationController } from "@firecms/core";
import { useDataTalk } from "@firecms/datatalk";

export function DataTalkSuggestions({
    onAnalyticsEvent
}: {
    onAnalyticsEvent?: (event: string, data?: object) => void;
}) {
    const navigate = useNavigate();
    const navigation = useNavigationController();

    const hasCollections = (navigation.collections ?? []).length > 0;
    const { rootPromptsSuggestions: suggestions } = useDataTalk();

    return <Collapse in={(suggestions ?? []).length > 0 && hasCollections} className={"mt-4"}>

        <div className={"flex flex-row gap-2 my-4"}>
            {suggestions && suggestions.map((suggestion, index) => {
                return <Label
                    className={"flex-1"}
                    border={true}
                    onClick={() => {
                        onAnalyticsEvent?.("datatalk:home_suggestion_clicked", {
                            suggestion
                        });
                        return navigate(navigation.homeUrl + "/datatalk?prompt=" + suggestion);
                    }}
                    key={index}>{suggestion}</Label>
            })}
        </div>
    </Collapse>;
}
