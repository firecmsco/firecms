import { Card, Typography } from "@firecms/ui";

export function IntroComponent({ onPromptSuggestionClick }: { onPromptSuggestionClick: (prompt: string) => void }) {
    return (
        <div className={"my-8"}>
            <Typography variant={"h3"} gutterBottom={true} className={"ml-4 my-2"}>
                Welcome to DataTalk
            </Typography>
            <Typography paragraph={true} className={"ml-4 my-2"}>
                DataTalk is a conversational interface to your data. You can ask questions, run commands and explore
                your data in a natural way.
            </Typography>
            <Typography paragraph={true} className={"ml-4 my-2 mb-6"}>
                Here are some examples of things you can ask:
            </Typography>
            <div className={"flex gap-2 md:gap-4"}>
                <PromptSuggestion onClick={onPromptSuggestionClick}
                                  prompt={"What can you do?"}/>
                <PromptSuggestion onClick={onPromptSuggestionClick}
                                  prompt={"What collections are available?"}/>
                <PromptSuggestion onClick={onPromptSuggestionClick}
                                  prompt={"Show me all products under 50 euros"}/>
                <PromptSuggestion onClick={onPromptSuggestionClick}
                                  prompt={"How many users were added in the last month?"}/>
            </div>
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
        <Card className={"px-4 pt-12 pb-4 border-none w-[220px] font-semibold flex items-end"} onClick={() => onClick(prompt)}>
            {prompt}
        </Card>
    );
}
