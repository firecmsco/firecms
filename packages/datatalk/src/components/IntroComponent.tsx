import { Alert, Card, Typography } from "@firecms/ui";
import { useTranslation } from "@firecms/core";
import { useDataTalk } from "../DataTalkProvider";

export function IntroComponent({ onPromptSuggestionClick }: { onPromptSuggestionClick: (prompt: string) => void }) {

    const { t } = useTranslation();
    const dataTalk = useDataTalk();

    const promptSuggestions = (dataTalk.rootPromptsSuggestions ?? []).length > 0
        ? dataTalk.rootPromptsSuggestions
        : [
            t("datatalk_sample_1"),
            t("datatalk_sample_2"),
            t("datatalk_sample_3"),
            t("datatalk_sample_4"),
            t("datatalk_sample_5")
        ];

    return (
        <div className={"my-8"}>
            <Typography variant={"h3"} gutterBottom={true} className={"font-mono ml-4 my-2"}>
                {t("datatalk_welcome")}
            </Typography>
            <Typography paragraph={true} className={"ml-4 my-2"}>
                {t("datatalk_subtitle")}
            </Typography>
            {promptSuggestions && <>
                <Typography paragraph={true} className={"ml-4 my-2 mb-6"}>
                    {t("datatalk_examples_title")}
                </Typography>
                <div className={"flex gap-1 sm:gap-2 md:gap-4 overflow-auto no-scrollbar"}>
                    {promptSuggestions.map((prompt, index) => (
                        <PromptSuggestion key={index} onClick={onPromptSuggestionClick} prompt={prompt}/>
                    ))}
                </div>
            </>}

            <Typography variant={"caption"} color={"secondary"} paragraph={true} className={"ml-4 my-2"}>
                {t("datatalk_note_generic")}
            </Typography>
            <Typography variant={"caption"} color={"secondary"} paragraph={true} className={"ml-4 my-2"}>
                {t("datatalk_note_dependencies")}
            </Typography>
        </div>
    );
}

function PromptSuggestion({
                              prompt,
                              onClick
                          }: { prompt: string, onClick: (prompt: string) => void }) {
    return (
        <Card className={"px-4 pt-12 pb-4 border-none w-[220px] min-w-[140px] font-semibold flex items-end"}
              onClick={() => onClick(prompt)}>
            {prompt}
        </Card>
    );
}
