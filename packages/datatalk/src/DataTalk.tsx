import React, { useCallback, useRef, useState } from "react";
import { Button, Checkbox, Label, SendIcon, TextareaAutosize, Tooltip } from "@firecms/ui";
import { MessageLayout } from "./components/MessageLayout";
import { streamDataTalkCommand } from "./api";
import { ChatMessage } from "./types";
import { IntroComponent } from "./components/IntroComponent";

const sampleSystemMessage = `This is system message.

- This is a list
- This is another item
- This is a third item

\`\`\`javascript
export default async () => {
    const productsRef = collection(getFirestore(), "products");
    return getDocs(query(productsRef, where("price", ">", 500)));
}
\`\`\``;

const sampleSystemMessage2 = `This is a delete script

\`\`\`javascript
export default async () => {
  const booksRef = collection(getFirestore(), "books");
  const books = await getDocs(booksRef);
  const batch = writeBatch(getFirestore());
  books.forEach((doc) => {
    batch.update(doc.ref, {thumbnail: deleteField()});
  });
  return await batch.commit();
}
\`\`\``;
const sampleSystemMessage3 = `Get a user

\`\`\`javascript
export default async () => {
  const userRef = doc(getFirestore(), "users", "user_id");
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    return userDoc.data();
  } else {
    // doc.data() will be undefined in this case
    console.log("No such document!");
  }
}
\`\`\``;

export function DataTalk({
                             projectId,
                             getBackendAuthToken
                         }: {
    projectId: string,
    getBackendAuthToken: () => Promise<string>;
}) {

    const [textInput, setTextInput] = useState<string>("");

    // const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
    const [autoRunCode, setAutoRunCode] = useState<boolean>(false);

    const [messages, setMessages] = useState<ChatMessage[]>([
        // {
        //     text: "Welcome to **DataTalk**! How can I help you?\n\nTry typing a command like `What collections are available?` or `Show me products cheaper than 50 euros`.",
        //     user: "SYSTEM",
        //     date: new Date()
        // },
        // {
        //     text: sampleSystemMessage,
        //     user: "SYSTEM",
        //     date: new Date()
        // },
        // {
        //     text: sampleSystemMessage3,
        //     user: "SYSTEM",
        //     date: new Date()
        // }
    ]);

    const submit = async (message: string) => {
        if (!message) return;

        const updatedMessages: ChatMessage[] = [
            ...messages,
            {
                text: message,
                user: "USER",
                date: new Date()
            }];
        setMessages([
            ...updatedMessages,
            {
                loading: true,
                text: "",
                user: "SYSTEM",
                date: new Date()
            }]);

        setTextInput("");

        const firebaseToken = await getBackendAuthToken();
        let currentMessageResponse = "";
        streamDataTalkCommand(firebaseToken, message, projectId, messages, (newDelta) => {
            currentMessageResponse += newDelta;
            setMessages([
                ...updatedMessages,
                {
                    loading: true,
                    text: currentMessageResponse,
                    user: "SYSTEM",
                    date: new Date()
                }
            ]);
            // console.log("New message", newDelta);
        })
            .then((newMessage) => {
                setMessages([
                    ...updatedMessages,
                    {
                        loading: false,
                        text: newMessage,
                        user: "SYSTEM",
                        date: new Date()
                    }
                ]);
            })
            .catch((e) => {
                console.error("Error processing command", e);
                setMessages([
                    ...updatedMessages,
                    {
                        loading: false,
                        text: "There was an error processing your command. Please try again.",
                        user: "SYSTEM",
                        date: new Date()
                    }
                ]);
            });
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit(textInput);
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);

    const scrollInto = useCallback((childRef: React.RefObject<HTMLDivElement>) => {
        setTimeout(() => {
            childRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 150);
    }, []);

    return (

        <div className="h-full w-full flex flex-col bg-slate-100 dark:bg-gray-900">
            <div className="h-full overflow-auto" ref={containerRef}>
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

                    <IntroComponent onPromptSuggestionClick={(prompt) => submit(prompt)}/>

                    {messages.map((message, index) => {
                        return <MessageLayout key={message.date.toISOString() + index}
                                              onRemove={() => {
                                                  const newMessages = [...messages];
                                                  newMessages.splice(index, 1);
                                                  setMessages(newMessages);
                                              }}
                                              scrollInto={scrollInto}
                                              message={message}
                                              autoRunCode={autoRunCode}/>;
                    })}

                    {/*{loading && <MessageLayout key="loading" loading={true}/>}*/}

                </div>
            </div>

            <div className="container sticky bottom-0 right-0 left-0 mx-auto px-4 md:px-6 pb-8 pt-4">
                <form
                    noValidate
                    onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                        submit(textInput);
                    }}
                    autoComplete="off"
                    className="relative bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center gap-2 ">
                    <TextareaAutosize
                        value={textInput}
                        autoFocus={true}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="flex-1 resize-none rounded-lg p-4 border-none focus:ring-0 dark:bg-gray-800 dark:text-gray-300 pr-[80px]"
                        placeholder="Type your message..."
                    />
                    <Button className={"absolute right-0 top-0 m-1.5"} variant="text" type={"submit"}
                            disabled={!textInput}>
                        <SendIcon color={"primary"}/>
                    </Button>
                </form>
            </div>
        </div>

    )
}
