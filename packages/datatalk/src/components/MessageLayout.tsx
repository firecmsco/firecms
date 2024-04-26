import { AutoAwesomeIcon, Avatar, Menu, MenuItem, PersonIcon, Skeleton } from "@firecms/ui";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage } from "../types";
import { SystemMessage } from "./SystemMessage";

export function MessageLayout({
                                  message,
                                  autoRunCode,
                                  onRemove,
                                  scrollInto
                              }: {
    message?: ChatMessage,
    autoRunCode?: boolean,
    onRemove?: () => void,
    scrollInto?: (ref: React.RefObject<HTMLDivElement>) => void
}) {

    const ref = useRef<HTMLDivElement>(null);
    const scrolled = useRef(false);

    useEffect(() => {
        if (scrolled.current) return;
        scrollInto?.(ref);
        scrolled.current = true;
    }, [scrollInto]);

    const [containerWidth, setContainerWidth] = useState<number | null>(null);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            if (ref.current) {
                const rect = ref.current?.getBoundingClientRect();
                setContainerWidth(rect.width);
            }
        });

        if (ref.current) {
            resizeObserver.observe(ref.current);
        }

        return () => resizeObserver.disconnect();
    }, [ref]);

    return <div ref={ref} className="flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3 justify-center">
            <Menu trigger={<Avatar className="w-10 h-10 shrink-0">
                {message?.user === "USER" ? <PersonIcon/> : <AutoAwesomeIcon/>}
            </Avatar>}>
                <MenuItem dense onClick={onRemove}>Remove</MenuItem>
            </Menu>

            <div className="mt-3 flex-1 text-gray-700 dark:text-gray-300">

                {message
                    ? (message.user === "USER"
                        ? <UserMessage text={message.text}/>
                        : <SystemMessage text={message.text}
                                         autoRunCode={autoRunCode}
                                         scrollInto={() => scrollInto?.(ref)}
                                         containerWidth={containerWidth ?? undefined}/>)
                    : null}

                {message?.loading && <Skeleton className={"max-w-4xl mt-2 mb-4"}/>}
            </div>
        </div>
    </div>;
}

function UserMessage({ text }: { text: string }) {
    return <>{text.split("\n").map((line, index) => <p key={index}>{line}</p>)}</>
}
