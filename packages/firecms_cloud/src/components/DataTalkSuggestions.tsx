import { Collapse, Label } from "@firecms/ui";
import { useNavigate } from "react-router";
import { useNavigationController } from "@firecms/core";

export function DataTalkSuggestions({ suggestions }: {
    suggestions?: string[]
}) {
    const navigate = useNavigate();
    const navigation = useNavigationController();

    return <Collapse in={(suggestions ?? []).length > 0}>
        <div className={"flex flex-row gap-2 my-4"}>
            {suggestions && suggestions.map((suggestion, index) => {
                return <Label
                    className={"flex-1"}
                    border={true}
                    onClick={() => {
                        return navigate(navigation.homeUrl + "/datatalk?prompt=" + suggestion);
                    }}
                    key={index}>{suggestion}</Label>
            })}
        </div>
    </Collapse>;
}
