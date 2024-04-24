import { useEffect, useState } from "react";
import { MarkdownElement, parseMarkdown } from "../utils/parser";
import { CodeBlock } from "./CodeBlock";

export function SystemMessage({
                                  text,
                                  containerWidth,
                                  scrollInto,
                                  autoRunCode
                              }: {
    text?: string,
    containerWidth?: number,
    scrollInto: () => void,
    autoRunCode?: boolean
}) {

    const [parsedElements, setParsedElements] = useState<MarkdownElement[] | null>();

    useEffect(() => {
        if (text) {
            const markdownElements = parseMarkdown(text);
            setParsedElements(markdownElements);
            scrollInto();
        }
    }, [scrollInto, text]);

    return <>

        {parsedElements && parsedElements.map((element, index) => {
            if (element.type === "html") {
                return <div
                    className={"max-w-full prose-sm dark:prose-invert prose-headings:font-title text-base text-gray-700 dark:text-gray-300"}
                    dangerouslySetInnerHTML={{ __html: element.content }}
                    key={index}/>;
            } else if (element.type === "code") {
                return <CodeBlock key={index}
                                  autoRunCode={autoRunCode}
                                  initialCode={element.content}
                                  maxWidth={containerWidth ? containerWidth - 90 : undefined}/>;
            } else {
                console.error("Unknown element type", element);
                return null;
            }
        })}
    </>;
}
