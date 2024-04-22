import React, { useRef, useState } from "react";
import { Button, TextareaAutosize } from "@firecms/ui";
import { UserMessage } from "./components/UserMessage";
import { SystemMessage } from "./components/SystemMessage";
import { sendDataTalkCommand } from "./api";

export type ChatMessage = {
    text: string;
    user: "USER" | "SYSTEM";
    date: Date;
};

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
const sampleSystemMessage3 = `This is a console log

\`\`\`javascript
console.log("Hello world");
\`\`\``;

export function DataTalk() {

    const [textInput, setTextInput] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const [messages, setMessages] = useState<ChatMessage[]>([{
        text: "This is test message",
        user: "USER",
        date: new Date()
    }, {
        text: sampleSystemMessage,
        user: "SYSTEM",
        date: new Date()
    }, {
        text: sampleSystemMessage2,
        user: "SYSTEM",
        date: new Date()
    }, {
        text: sampleSystemMessage3,
        user: "SYSTEM",
        date: new Date()
    }]);

    const onSubmit = (e: React.FormEvent) => {
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
        sendDataTalkCommand(textInput)
            .then(({ code }) => {
                setMessages([
                    ...updatedMessages,
                    {
                        text: code,
                        user: "SYSTEM",
                        date: new Date()
                    }]);
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
                    {messages.map((message, index) => {
                        if (message.user === "SYSTEM") {
                            return (
                                <SystemMessage key={index} text={message.text}/>
                            );
                        } else if (message.user === "USER") {
                            return (
                                <UserMessage key={index} text={message.text}/>
                            );
                        } else {
                            console.error("Unmapped message type", message);
                            return null;
                        }
                    })}
                    {loading && <SystemMessage text={"Loading"}/>}
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
