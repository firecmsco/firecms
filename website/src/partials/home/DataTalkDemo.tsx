import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import CodeBlock from "@theme/CodeBlock";
import { defaultBorderMixin } from "../styles";

export interface Exchange {
    query: string;
    responseText?: string;
    code?: string;
    Component?: React.FC;
}

type TimeoutId = ReturnType<typeof setTimeout> | null;

export function DataTalkDemo({ exchanges }: {
    exchanges: Exchange[]
}): JSX.Element {
    const [currentExchangeIndex, setCurrentExchangeIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const [showResponse, setShowResponse] = useState(false);

    const typingTimeout = useRef<TimeoutId>(null);
    const responseTimeout = useRef<TimeoutId>(null);
    const nextTimeout = useRef<TimeoutId>(null);

    const currentExchange = exchanges[currentExchangeIndex];

    useEffect(() => {
        if (!isTyping) return () => {
        };
        const q = currentExchange.query;
        if (displayText.length < q.length) {
            typingTimeout.current = setTimeout(() => {
                setDisplayText(q.slice(0, displayText.length + 1));
            }, 40);
        } else {
            setIsTyping(false);
            setShowResponse(true);
        }
        return () => {
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
        };
    }, [displayText, isTyping, currentExchangeIndex]);

    useEffect(() => {
        if (!showResponse) return () => {
        };
        responseTimeout.current = setTimeout(() => setShowResponse(false), 4000);
        return () => {
            if (responseTimeout.current) clearTimeout(responseTimeout.current);
        };
    }, [showResponse]);

    useEffect(() => {
        if (isTyping || showResponse) return () => {
        };
        nextTimeout.current = setTimeout(() => {
            setCurrentExchangeIndex((i) => (i + 1) % exchanges.length);
            setDisplayText("");
            setIsTyping(true);
        }, 300);
        return () => {
            if (nextTimeout.current) clearTimeout(nextTimeout.current);
        };
    }, [isTyping, showResponse]);

    const handleRunCode = (code: string) => {

    };
    const handleCopyCode = (code: string) =>
        navigator.clipboard?.writeText(code);
    const handleFeedback = (type: string) =>
        alert(`Feedback (${type}) not implemented.`);

    return (

        <div className={"mt-8 mb-12 bg-gray-800 rounded-xl p-6 border " + defaultBorderMixin}>
            <div
                className="container mx-auto flex-1 flex flex-col gap-4 overflow-y-auto"
                style={{ height: 500 }}
            >
                {/* User Query */}
                <div
                    className="flex flex-col gap-2 bg-surface-800 bg-opacity-20 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div
                            className="rounded-full flex items-center justify-center overflow-hidden p-1 w-12 h-12">
                  <span
                      className="bg-surface-accent-800 flex items-center justify-center w-10 h-10 rounded-full">
                    <span className="material-icons" style={{ fontSize: 24 }}>
                      person
                    </span>
                  </span>
                        </div>
                        <div className="flex-1 text-surface-200">
                            <p className="min-h-[1.5em] font-semibold">
                                {displayText}
                                {isTyping && (
                                    <span
                                        className="inline-block w-0.5 h-5 bg-current animate-pulse ml-1 align-middle"/>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* AI Response */}
                <div
                    className={clsx(
                        "flex flex-col gap-2 rounded-lg p-4 shadow-sm",
                        "transition-all duration-300 ease-in-out overflow-hidden",
                        showResponse ? "opacity-100 max-h-[600px]" : "opacity-0 max-h-0"
                    )}
                >
                    {currentExchange && (
                        <div className="flex items-start gap-3">
                            {/* AI avatar */}
                            <div
                                className="rounded-full flex items-center justify-center overflow-hidden p-1 w-12 h-12">
                    <span
                        className="bg-surface-accent-800 flex items-center justify-center w-10 h-10 rounded-full">
                      <span className="material-icons" style={{ fontSize: 24 }}>
                        auto_fix_high
                      </span>
                    </span>
                            </div>

                            <div className="mt-2 flex-1 text-surface-200">
                                {currentExchange.responseText && <div
                                    className="max-w-full prose-invert prose-headings:font-title text-base mb-4">
                                    <p>{currentExchange.responseText}</p>
                                </div>}

                                <div className="flex flex-col my-4 gap-2" style={{ maxWidth: 1050 }}>
                                    <div className="flex flex-row w-full gap-4 items-start">

                                        {currentExchange.Component && <currentExchange.Component/>}
                                        {currentExchange.code && <>
                                            <CodeBlock language="javascript" className={"flex-1 text-sm"}>
                                                {currentExchange.code}
                                            </CodeBlock>
                                            <button
                                                type="button"
                                                onClick={() => handleRunCode(currentExchange.code)}
                                                className="typography-button h-fit rounded-md whitespace-nowrap inline-flex items-center justify-center p-2 focus:outline-none transition ease-in-out duration-150 gap-2 w-fit border border-primary bg-primary focus:ring-primary shadow hover:ring-1 hover:ring-primary text-white hover:text-white py-1 px-2 flex-shrink-0"
                                            >
                                                Run Code
                                            </button>
                                        </>

                                        }
                                    </div>
                                </div>

                                {/* feedback buttons */}
                                <div className="mt-2 flex flex-row gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleCopyCode(currentExchange.code)}
                                        title="Copy code"
                                        className="cursor-pointer text-surface-accent-300 bg-transparent hover:bg-gray-500/20 inline-flex items-center justify-center p-2 text-sm font-medium rounded-full w-8 h-8 min-w-8 min-h-8"
                                    >
                        <span className="material-icons" style={{ fontSize: 18 }}>
                          content_copy
                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleFeedback("thumb_up")}
                                        title="Good response"
                                        className="cursor-pointer text-surface-accent-300 bg-transparent hover:bg-gray-500/20 inline-flex items-center justify-center p-2 text-sm font-medium rounded-full w-8 h-8 min-w-8 min-h-8"
                                    >
                        <span className="material-icons" style={{ fontSize: 18 }}>
                          thumb_up_off_alt
                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleFeedback("thumb_down")}
                                        title="Bad response"
                                        className="cursor-pointer text-surface-accent-300 bg-transparent hover:bg-gray-500/20 inline-flex items-center justify-center p-2 text-sm font-medium rounded-full w-8 h-8 min-w-8 min-h-8"
                                    >
                        <span className="material-icons" style={{ fontSize: 18 }}>
                          thumb_down_off_alt
                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
