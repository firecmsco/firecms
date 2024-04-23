import { AutoAwesomeIcon, Avatar, Skeleton } from "@firecms/ui";

import { useEffect, useRef, useState } from "react";
import { MarkdownElement, parseMarkdown } from "../utils/parser";
import { CodeBlock } from "./CodeBlock";

export function SystemMessage({
                                  text,
                                  loading
                              }: { text?: string, loading?: boolean }) {

    const [parsedElements, setParsedElements] = useState<MarkdownElement[] | null>();

    const ref = useRef<HTMLDivElement>(null);
    const scrolled = useRef(false);
    const [containerWidth, setContainerWidth] = useState<number | null>(null);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            console.log("resize", entries)
            if (ref.current) {
                const rect = ref.current?.getBoundingClientRect();
                setContainerWidth(rect.width);
                // console.log("resize", ref.current, rect);
                // editorRef.current.layout({
                //     width: rect.width - 4,
                //     height: rect.height
                // })
            }
        });

        if (ref.current) {
            resizeObserver.observe(ref.current);
        }

        return () => resizeObserver.disconnect();
    }, [ref]);

    function scrollInto() {
        setTimeout(() => {
            ref.current?.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });
        }, 120);
    }

    useEffect(() => {
        if (scrolled.current) return;
        scrollInto();
        scrolled.current = true;
    }, []);

    useEffect(() => {
        if (text) {
            const markdownElements = parseMarkdown(text);
            setParsedElements(markdownElements);
            scrollInto();
        }
    }, [text]);
console.log("containerWidth", containerWidth)
    return <div ref={ref} className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10" outerClassName={"w-12"}>
                <AutoAwesomeIcon/>
            </Avatar>
            <div className={"flex-grow w-full"}>

                {loading && <Skeleton className={"max-w-4xl mt-2 mb-4"}/>}

                {parsedElements && parsedElements.map((element, index) => {
                    if (element.type === "html") {
                        return <div
                            className={"max-w-full mt-2 prose dark:prose-invert prose-headings:font-title text-gray-700 dark:text-gray-300"}
                            dangerouslySetInnerHTML={{ __html: element.content }}
                            key={index}/>;
                    } else if (element.type === "code") {
                        return <CodeBlock key={index}
                                          initialCode={element.content}
                                          maxWidth={containerWidth ? containerWidth - 90 : undefined}/>;
                    } else {
                        console.error("Unknown element type", element);
                        return null;
                    }
                })}
            </div>
        </div>
    </div>;
}
