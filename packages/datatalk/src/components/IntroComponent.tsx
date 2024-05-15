import { Alert, Card, Typography } from "@firecms/ui";
import { useDataTalk } from "../DataTalkProvider";

export function IntroComponent({ onPromptSuggestionClick }: { onPromptSuggestionClick: (prompt: string) => void }) {

    const dataTalk = useDataTalk();

    const promptSuggestions = (dataTalk.rootPromptsSuggestions ?? []).length > 0
        ? dataTalk.rootPromptsSuggestions
        : [
            "What can you do?",
            "What collections are available?",
            "Show me all products under 50 euros",
            "Create a new book with data for El Quijote.",
            "Show me the 10 cars with the most horsepower."
        ];

    return (
        <div className={"my-8"}>
            <Typography variant={"h3"} gutterBottom={true} className={"font-mono ml-4 my-2"}>
                Welcome to DATATALK
            </Typography>
            <Alert>
                DATATALK is FREE during the beta period.
            </Alert>
            <Typography paragraph={true} className={"ml-4 my-2"}>
                DataTalk is a conversational interface to your data. You can ask questions, run commands and explore
                your data in a natural way.
            </Typography>
            {promptSuggestions && <>
                <Typography paragraph={true} className={"ml-4 my-2 mb-6"}>
                    Here are some examples of things you can ask:
                </Typography>
                <div className={"flex gap-1 sm:gap-2 md:gap-4 overflow-auto no-scrollbar"}>
                    {promptSuggestions.map((prompt, index) => (
                        <PromptSuggestion key={index} onClick={onPromptSuggestionClick} prompt={prompt}/>
                    ))}
                </div>
            </>}

            <Typography variant={"caption"} color={"secondary"} paragraph={true} className={"ml-4 my-2"}>
                Note that these sample prompts are generic and may not work with your specific data.
            </Typography>
            <Typography variant={"caption"} color={"secondary"} paragraph={true} className={"ml-4 my-2"}>
                You can&apos;t add additional imports or dependencies to the code snippets.
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
