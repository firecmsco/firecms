import React, { useRef, useState } from "react";
import { Button, Checkbox, Label, TextareaAutosize } from "@firecms/ui";
import { MessageLayout } from "./components/MessageLayout";
import { sendDataTalkCommand } from "./api";
import { ChatMessage } from "./types";

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

export function DataTalk({
                             projectId,
                             getBackendAuthToken
                         }: {
    projectId: string,
    getBackendAuthToken: () => Promise<string>;
}) {

    const [textInput, setTextInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
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
        // }, {
        //     text: sampleSystemMessage2,
        //     user: "SYSTEM",
        //     date: new Date()
        // }
    ]);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textInput) return;
        setLoading(true);
        const updatedMessages: ChatMessage[] = [
            ...messages,
            {
                text: textInput,
                user: "USER",
                date: new Date()
            }];
        setMessages(updatedMessages);
        setTextInput("");

        const firebaseToken = await getBackendAuthToken();
        sendDataTalkCommand(firebaseToken, textInput, projectId, messages)
            .then((newMessage) => {
                setMessages([
                    ...updatedMessages,
                    newMessage
                ]);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSubmit(event);
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);
    return (

        <div className="h-full w-full flex flex-col bg-slate-100 dark:bg-gray-900">
            <div className="h-full overflow-auto" ref={containerRef}>
                <div className="container mx-auto px-4 md:px-6 py-8 flex-1 flex flex-col gap-4">
                    <Label
                        className="border cursor-pointer rounded-md p-2 flex items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800 w-fit self-end"
                        htmlFor="autoRunCode"
                    >
                        <Checkbox id="autoRunCode"
                                  checked={autoRunCode}
                                  size={"small"}
                                  onCheckedChange={setAutoRunCode}/>
                        Run code automatically
                    </Label>
                    {messages.map((message, index) => {
                        return <MessageLayout key={message.date.toISOString() + index}
                                              onRemove={() => {
                                                  const newMessages = [...messages];
                                                  newMessages.splice(index, 1);
                                                  setMessages(newMessages);
                                              }}
                                              message={message}
                                              autoRunCode={autoRunCode}/>;
                    })}
                    {loading && <MessageLayout key="loading" loading={true}/>}
                </div>
            </div>
            <div className="container sticky bottom-0 right-0 left-0 mx-auto px-4 md:px-6 pb-8 pt-4">
                <form
                    noValidate
                    onSubmit={onSubmit}
                    autoComplete="off"
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center gap-2 pr-4">
                    <TextareaAutosize
                        value={textInput}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="flex-1 resize-none rounded-lg p-4 border-none focus:ring-0 dark:bg-gray-800 dark:text-gray-300"
                        placeholder="Type your message..."
                    />
                    <Button variant="outlined" type={"submit"} disabled={!textInput}>Send</Button>
                </form>
            </div>
        </div>

    )
}
