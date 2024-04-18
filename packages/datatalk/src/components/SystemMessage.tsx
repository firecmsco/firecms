import { AutoAwesomeIcon, Avatar } from "@firecms/ui";

import { useEffect, useRef, useState } from "react";
import { MarkdownElement, parseMarkdown } from "../utils/parser";
import { CodeBlock } from "./CodeBlock";

export function SystemMessage({ text }: { text: string }) {

    const [parsedElements, setParsedElements] = useState<MarkdownElement[] | null>(parseMarkdown(text));

    const ref = useRef<HTMLDivElement>(null);
    const scrolled = useRef(false);
    useEffect(() => {
        if (scrolled.current) return;
        setTimeout(() => {
            ref.current?.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }, 100);
        scrolled.current = true;
    }, []);

    useEffect(() => {
        setParsedElements(parseMarkdown(text));
    }, [text]);

    return <div ref={ref} className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10 shrink-0">
                <AutoAwesomeIcon/>
            </Avatar>
            <div className={"mt-3 w-full"}>
                {parsedElements && parsedElements.map((element, index) => {
                    if (element.type === "html") {
                        return <div
                            className={"prose dark:prose-invert prose-headings:font-title text-gray-700 dark:text-gray-300"}
                            dangerouslySetInnerHTML={{ __html: element.content }}
                            key={index}/>;
                    } else if (element.type === "code") {
                        return <CodeBlock key={index} initialCode={element.content}/>;
                    } else {
                        console.error("Unknown element type", element);
                        return null;
                    }
                })}
            </div>
        </div>
    </div>;
}
