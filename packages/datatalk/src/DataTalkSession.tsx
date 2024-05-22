import React, { useCallback, useEffect, useState } from "react";
import { EntityCollection, randomString } from "@firecms/core";
import { Button, Checkbox, Label, SendIcon, TextareaAutosize, Tooltip } from "@firecms/ui";
import { MessageLayout } from "./components/MessageLayout";
import { streamDataTalkCommand } from "./api";
import { ChatMessage, FeedbackSlug, Session } from "./types";
import { IntroComponent } from "./components/IntroComponent";

export function DataTalkSession({
                                    session,
                                    initialPrompt,
                                    apiEndpoint,
                                    onAnalyticsEvent,
                                    getAuthToken,
                                    collections,
                                    onMessagesChange,
                                    autoRunCode,
                                    setAutoRunCode
                                }: {
    session: Session,
    initialPrompt?: string,
    onAnalyticsEvent?: (event: string, params?: any) => void,
    apiEndpoint: string,
    getAuthToken: () => Promise<string>,
    collections?: EntityCollection[],
    onMessagesChange?: (messages: ChatMessage[]) => void,
    autoRunCode: boolean,
    setAutoRunCode: (value: boolean) => void
}) {

    const [textInput, setTextInput] = useState<string>("");

    const [messages, setMessages] = useState<ChatMessage[]>(session.messages || []);
    const [messageLoading, setMessageLoading] = useState<boolean>(false);

    useEffect(() => {
        if (initialPrompt && messages.length === 0) {
            submit(initialPrompt);
        }
    }, []);

    const scrollInto = useCallback((childRef: React.RefObject<HTMLDivElement>) => {
        setTimeout(() => {
            childRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 150);
    }, []);

    const submit = async (messageText: string, baseMessages: ChatMessage[] = messages) => {
        if (!messageText) return;

        if (onAnalyticsEvent) {
            onAnalyticsEvent("message_sent", { message: messageText });
        }

        const userMessageId = randomString(20);
        const systemMessageId = randomString(20);

        const newMessages: ChatMessage[] = [
            ...baseMessages,
            {
                id: userMessageId,
                text: messageText,
                user: "USER",
                date: new Date()
            }];
        onMessagesChange?.(newMessages);
        setMessages([
            ...newMessages,
            {
                id: systemMessageId,
                loading: true,
                text: "",
                user: "SYSTEM",
                date: new Date()
            }]);

        setTextInput("");

        const firebaseToken = await getAuthToken();
        let currentMessageResponse = "";

        setMessageLoading(true);
        streamDataTalkCommand(firebaseToken,
            messageText,
            apiEndpoint,
            session.id,
            baseMessages,
            (newDelta) => {
                currentMessageResponse += newDelta;
                setMessages([
                    ...newMessages,
                    {
                        id: systemMessageId,
                        loading: true,
                        text: currentMessageResponse,
                        user: "SYSTEM",
                        date: new Date()
                    }
                ]);
            })
            .then((newMessage) => {
                const updatedMessages: ChatMessage[] = [
                    ...newMessages,
                    {
                        id: systemMessageId,
                        loading: false,
                        text: newMessage,
                        user: "SYSTEM",
                        date: new Date()
                    }
                ];
                setMessages(updatedMessages);
                onMessagesChange?.(updatedMessages);
            })
            .catch((e) => {
                console.error("Error processing command", e);
                const updatedMessages: ChatMessage[] = [
                    ...newMessages,
                    {
                        id: systemMessageId,
                        loading: false,
                        text: "There was an error processing your command: " + e.message,
                        user: "SYSTEM",
                        date: new Date()
                    }
                ];
                setMessages(updatedMessages);
                onMessagesChange?.(updatedMessages);
            }).finally(() => {
            setMessageLoading(false);
        });

    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit(textInput);
        }
    };

    const onRegenerate = (message: ChatMessage, index: number) => {
        if (onAnalyticsEvent) {
            onAnalyticsEvent("regenerate", { message });
        }

        const newMessages = [...messages];
        newMessages.splice(index);
        const lastUserMessage = newMessages.filter(m => m.user === "USER").pop();
        newMessages.splice(index - 1);

        // get text from the last user message
        if (lastUserMessage) {
            submit(lastUserMessage.text, newMessages);
        }
    };

    const saveFeedback = (message: ChatMessage, reason: FeedbackSlug | undefined, feedbackMessage: string | undefined, index: number) => {
        if (onAnalyticsEvent) {
            onAnalyticsEvent("bad_response", {
                reason,
                feedbackMessage
            });
        }
        // update the message with the feedback
        const newMessages = [...messages];
        const messageToUpdate = newMessages[index];
        if (messageToUpdate) {
            messageToUpdate.negative_feedback = {
                reason,
                message: feedbackMessage
            };
            setMessages(newMessages);
            onMessagesChange?.(newMessages);
        }
    };

    const updateMessage = (message: ChatMessage, index: number) => {
        const newMessages = [...messages];
        newMessages[index] = message;
        setMessages(newMessages);
        onMessagesChange?.(newMessages);
    }

    return (

        <div className="h-full w-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="h-full overflow-auto">
                <div className="container mx-auto px-4 md:px-6 py-8 flex-1 flex flex-col gap-4">

                    <Tooltip
                        className={"self-end"}
                        delayDuration={500}
                        title={"Run snippets of code generated by DataTalk automatically.\nCaution: This can be risky since scripts may modify your data in ways you don't expect"}>
                        <Label
                            className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800 w-fit "
                            htmlFor="autoRunCode">
                            <Checkbox id="autoRunCode"
                                      checked={autoRunCode}
                                      size={"small"}
                                      onCheckedChange={setAutoRunCode}/>
                            Run code automatically
                        </Label>
                    </Tooltip>

                    {(messages ?? []).length === 0 &&
                        <IntroComponent onPromptSuggestionClick={(prompt) => submit(prompt)}/>}

                    {messages.map((message, index) => {
                        return <MessageLayout key={message.date.toISOString() + index}
                                              onRemove={() => {
                                                  const newMessages = [...messages];
                                                  newMessages.splice(index, 1);
                                                  setMessages(newMessages);
                                              }}
                                              onFeedback={(reason, feedbackMessage) => {
                                                  saveFeedback(message, reason, feedbackMessage, index);
                                              }}
                                              onUpdatedMessage={(message) => {
                                                  updateMessage(message, index);
                                              }}
                                              collections={collections}
                                              scrollInto={scrollInto}
                                              message={message}
                                              canRegenerate={index === messages.length - 1 && message.user === "SYSTEM"}
                                              onRegenerate={() => onRegenerate(message, index)}
                                              autoRunCode={autoRunCode}/>;
                    })}

                </div>
            </div>

            <div className="container sticky bottom-0 right-0 left-0 mx-auto px-4 md:px-6 pb-8 pt-4">
                <form
                    noValidate
                    onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                        if (!messageLoading && textInput)
                            submit(textInput);
                    }}
                    autoComplete="off"
                    className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center gap-2 ">
                    <TextareaAutosize
                        value={textInput}
                        autoFocus={true}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="flex-1 resize-none rounded-lg p-4 border-none focus:ring-0 dark:bg-gray-800 dark:text-gray-200 pr-[80px]"
                        placeholder="Type your message..."
                    />
                    <Button className={"absolute right-0 top-0 m-1.5"} variant="text" type={"submit"}
                            disabled={!textInput || messageLoading}>
                        <SendIcon color={"primary"}/>
                    </Button>
                </form>
            </div>
        </div>

    )
}
