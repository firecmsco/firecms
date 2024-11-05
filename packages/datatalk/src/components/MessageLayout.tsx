import { AutoAwesomeIcon, Avatar, Menu, MenuItem, PersonIcon } from "@firecms/ui";
import React, { useEffect, useRef, useState } from "react";
import { ChatMessage, FeedbackSlug } from "../types";
import { SystemMessage } from "./SystemMessage";
import { EntityCollection } from "@firecms/core";

export function MessageLayout({
                                  message,
                                  autoRunCode,
                                  onRemove,
                                  collections,
                                  onRegenerate,
                                  canRegenerate,
                                  onFeedback,
                                  onUpdatedMessage
                              }: {
    message?: ChatMessage,
    autoRunCode?: boolean,
    onRemove?: () => void,
    collections?: EntityCollection[],
    onRegenerate?: () => void,
    canRegenerate?: boolean,
    onFeedback?: (reason?: FeedbackSlug, feedbackMessage?: string) => void,
    onUpdatedMessage?: (message: ChatMessage) => void
}) {

    const ref = useRef<HTMLDivElement>(null);
    const onUpdatedMessageInternal = (updatedText: string) => {
        if (!message) return;
        if (onUpdatedMessage) onUpdatedMessage({
            ...message,
            text: updatedText
        });
    }

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

    return <div ref={ref}
                className="flex flex-col gap-2 bg-white dark:bg-surface-800 dark:bg-opacity-20 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3 justify-center">
            <Menu trigger={<Avatar className="w-10 h-10 shrink-0">
                {message?.user === "USER" ? <PersonIcon/> : <AutoAwesomeIcon/>}
            </Avatar>}>
                <MenuItem dense onClick={onRemove}>Remove</MenuItem>
            </Menu>

            <div className="mt-3 flex-1 text-surface-700 dark:text-surface-200">

                {message
                    ? (message.user === "USER"
                        ? <UserMessage text={message.text}/>
                        : <SystemMessage text={message.text}
                                         loading={message.loading}
                                         autoRunCode={autoRunCode}
                                         collections={collections}
                                         canRegenerate={canRegenerate}
                                         containerWidth={containerWidth ?? undefined}
                                         onRegenerate={onRegenerate}
                                         onUpdatedMessage={onUpdatedMessageInternal}
                                         onFeedback={onFeedback}/>)
                    : null}

            </div>
        </div>
    </div>;
}

function UserMessage({ text }: { text: string }) {
    return <>{text.split("\n").map((line, index) => <p key={index}>{line}</p>)}</>
}
