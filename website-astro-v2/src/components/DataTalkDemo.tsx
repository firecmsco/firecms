import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CodeBlock } from "./CodeBlock";

export interface Exchange {
    query: string;
    responseText?: string;
    code?: string;
    showProductsTable?: boolean;
    showUsersTable?: boolean;
}

type TimeoutId = ReturnType<typeof setTimeout> | null;

export function DataTalkDemo({
                                 exchanges,
                                 height
                             }: {
    height?: string | number;
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
            }, 20);
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
        responseTimeout.current = setTimeout(() => setShowResponse(false), 3000);
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
        }, 200);
        return () => {
            if (nextTimeout.current) clearTimeout(nextTimeout.current);
        };
    }, [isTyping, showResponse]);

    const handleRunCode = (_code?: string) => {
        // Code execution not implemented for demo
    };
    const handleCopyCode = (code?: string) => {
        if (code) navigator.clipboard?.writeText(code);
    };

    return (
        <div className=" bg-surface-950 rounded-xl p-6">
            <div
                className="container mx-auto flex-1 flex flex-col gap-4 overflow-hidden"
                style={{ height: height }}
            >
                {/* User Query */}
                <div className="flex flex-col gap-3 bg-surface-900/70 rounded-xl p-4">
                    <div className="flex items-center gap-6">
                        <div
                            className="rounded-full flex items-center justify-center flex-shrink-0 w-10 h-10 bg-surface-700">
                            <span className="material-icons text-surface-200" style={{ fontSize: 20 }}>person</span>
                        </div>
                        <div className="flex-1 text-surface-200">
                            <p className="min-h-[1.5em] font-semibold leading-relaxed">
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
                        "flex flex-col gap-3 rounded-lg p-4",
                        "transition-all duration-300 ease-in-out overflow-hidden",
                        showResponse ? "opacity-100 max-h-[600px]" : "opacity-0 max-h-0"
                    )}
                >
                    {currentExchange && (
                        <div className="flex items-start gap-6">
                            {/* AI avatar */}
                            <div
                                className="rounded-full flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-600">
                                <span className="material-icons text-white"
                                      style={{ fontSize: 20 }}>auto_fix_high</span>
                            </div>

                            <div className="flex-1 text-surface-200">
                                {currentExchange.responseText && (
                                    <div className="max-w-full text-base mb-3">
                                        <p className="leading-relaxed">{currentExchange.responseText}</p>
                                    </div>
                                )}

                                <div className="flex flex-col my-2 gap-3">

                                    <div className="flex flex-row w-full gap-4 items-start">
                                        {currentExchange.code && (
                                            <>
                                                <CodeBlock language="javascript" className="flex-1 text-sm">
                                                    {currentExchange.code}
                                                </CodeBlock>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRunCode(currentExchange.code)}
                                                    className="inline-flex items-center gap-x-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-200 ease-in-out btn-glow"
                                                >
                                                    Run Code
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {currentExchange.showProductsTable && (
                                        <div className="flex-1 w-full overflow-hidden">
                                            <ProductsDemoTable/>
                                        </div>
                                    )}

                                    {currentExchange.showUsersTable && (
                                        <div className="flex-1 w-full overflow-hidden">
                                            <UsersDemoTable/>
                                        </div>
                                    )}

                                </div>

                                {/* feedback buttons */}
                                <div className="mt-1 flex flex-row gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleCopyCode(currentExchange.code)}
                                        title="Copy code"
                                        className="cursor-pointer text-surface-300 bg-transparent hover:bg-surface-700/30 inline-flex items-center justify-center text-sm font-medium rounded-full w-8 h-8"
                                    >
                                        <span className="material-icons" style={{ fontSize: 18 }}>content_copy</span>
                                    </button>
                                    <button
                                        type="button"
                                        title="Good response"
                                        className="cursor-pointer text-surface-300 bg-transparent hover:bg-surface-700/30 inline-flex items-center justify-center text-sm font-medium rounded-full w-8 h-8"
                                    >
                                        <span className="material-icons"
                                              style={{ fontSize: 18 }}>thumb_up_off_alt</span>
                                    </button>
                                    <button
                                        type="button"
                                        title="Bad response"
                                        className="cursor-pointer text-surface-300 bg-transparent hover:bg-surface-700/30 inline-flex items-center justify-center text-sm font-medium rounded-full w-8 h-8"
                                    >
                                        <span className="material-icons"
                                              style={{ fontSize: 18 }}>thumb_down_off_alt</span>
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

const productsData = [
    ["B000UO4KXY", "Conceal Invisible Shelf", "Home storage", "225", "Euros"],
    ["B000ZHY0JK", "Aviator RB 3025", "Sunglasses", "115", "Euros"],
    ["B001A793IW", "Wobble Chess Set", "Toys and games", "119", "Euros"]
];

// Define colors for category/currency tags for variety (optional)
const categoryColors = [
    "bg-blue-950 text-blue-200",
    "bg-pink-950 text-pink-200",
    "bg-green-950 text-green-200",
    "bg-yellow-950 text-yellow-200",
    "bg-purple-950 text-purple-200",
    "bg-indigo-950 text-indigo-200",
];

export function ProductsDemoTable() {

    return (
        <div
            className="h-full w-full flex flex-col rounded-xl border border-surface-800 bg-surface-950/70 backdrop-blur-sm shadow-lg shadow-black/20">
            {/* Header Toolbar Section */}
            <div
                className="min-h-[48px] px-4 md:px-6 py-2 flex flex-row items-center justify-between w-full flex-shrink-0 bg-surface-950/60 border-b border-surface-800 rounded-t-xl">
                {/* Left Side: Title */}
                <div className="flex gap-4 md:mr-8 mr-4 self-stretch items-center">
                    <div className="hidden lg:block">
                        <div className="flex flex-col items-start justify-center">
                            <div
                                className="text-sm font-medium leading-none truncate max-w-[160px] lg:max-w-[240px] text-white">Products
                            </div>
                            <div
                                className="text-xs text-surface-400 w-full text-ellipsis overflow-hidden whitespace-nowrap max-w-xs text-left">{productsData.length} entities
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Side: Search and Action Buttons */}
                <div className="flex items-center gap-3">
                    <div
                        className="relative h-[32px] bg-surface-900/70 border border-surface-800 rounded-md flex items-center">
                        <div
                            className="absolute p-0 px-3 h-full pointer-events-none flex items-center justify-center top-0 left-0">
                            <span className="material-icons text-surface-500 text-xl">search</span>
                        </div>
                        <input placeholder="Search" readOnly
                               className="pointer-events-none placeholder-surface-500 bg-transparent outline-none border-none pl-10 h-full text-surface-200 w-[150px]"
                               value=""/>
                    </div>
                    <button type="button" title="Download"
                            className="cursor-pointer text-surface-300 inline-flex items-center justify-center p-2 text-sm hover:bg-surface-900 rounded-full w-9 h-9">
                        <span className="material-icons text-xl">download</span>
                    </button>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="flex-grow overflow-x-auto overflow-y-hidden">
                {/* Sticky Header Row */}
                <div
                    className="sticky top-0 z-10 flex flex-row w-fit min-w-full border-b border-surface-800 bg-gradient-to-b from-surface-950 to-surface-900/60 min-h-[52px]">
                    {/* Header Cell: ID */}
                    <div
                        className="flex px-4 py-3.5 h-full text-xs uppercase font-semibold select-none items-center text-surface-300 hover:text-surface-200 hover:bg-surface-900/60 relative"
                        style={{
                            minWidth: "140px",
                            maxWidth: "140px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-center">
                            <div className="truncate mx-1">ID</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-surface-700/60 opacity-50"></div>
                    </div>
                    {/* Header Cell: Name */}
                    <div
                        className="flex px-4 py-3.5 h-full text-xs uppercase font-semibold select-none items-center text-surface-300 hover:text-surface-200 hover:bg-surface-900/60 relative"
                        style={{
                            minWidth: "240px",
                            maxWidth: "240px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-start">
                            <span className="material-icons mr-2 text-xl" style={{ fontSize: "20px" }}>short_text</span>
                            <div className="truncate mx-1">Name</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-surface-700/60 opacity-50"></div>
                    </div>
                    {/* Header Cell: Category */}
                    <div
                        className="flex px-4 py-3.5 h-full text-xs uppercase font-semibold select-none items-center text-surface-300 hover:text-surface-200 hover:bg-surface-900/60 relative"
                        style={{
                            minWidth: "220px",
                            maxWidth: "220px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-start">
                            <span className="material-icons mr-2 text-xl" style={{ fontSize: "20px" }}>list</span>
                            <div className="truncate mx-1">Category</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-surface-700/60 opacity-50"></div>
                    </div>
                    {/* Header Cell: Price */}
                    <div
                        className="flex px-4 py-3.5 h-full text-xs uppercase font-semibold select-none items-center text-surface-300 hover:text-surface-200 hover:bg-surface-900/60 relative"
                        style={{
                            minWidth: "160px",
                            maxWidth: "160px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-end">
                            <span className="material-icons mr-2 text-xl">numbers</span>
                            <div className="truncate mx-1">Price</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-surface-700/60 opacity-50"></div>
                    </div>
                    {/* Header Cell: Currency */}
                    <div
                        className="flex px-4 py-3.5 h-full text-xs uppercase font-semibold select-none items-center text-surface-300 hover:text-surface-200 hover:bg-surface-900/60 relative"
                        style={{
                            minWidth: "140px",
                            maxWidth: "140px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-start">
                            <span className="material-icons mr-2 text-xl"
                                  style={{ fontSize: "20px" }}>euro_symbol</span>
                            <div className="truncate mx-1">Currency</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-surface-700/60 opacity-50"></div>
                    </div>
                    {/* Add Column Button Placeholder */}
                    <div
                        className="p-0.5 w-20 h-full flex items-center justify-center cursor-pointer bg-surface-950 hover:bg-surface-900/60 flex-shrink-0">
                        <span className="material-icons text-xl text-surface-400"
                              style={{ fontSize: "20px" }}>add</span>
                    </div>
                </div>

                {/* Data Rows */}
                <div className="w-fit min-w-full">
                    {productsData.map((row, index) => (
                        <div key={row[0]}
                             className="flex items-stretch text-sm leading-none even:bg-transparent odd:bg-surface-950/40 hover:bg-surface-900/40 transition-colors">
                            {/* Cell: ID */}
                            <div
                                className="flex items-center justify-center px-4 py-3.5 border-r border-b border-surface-800 bg-surface-950 flex-shrink-0"
                                style={{ width: "140px" }}>
                                <div
                                    className="w-full overflow-hidden truncate font-mono text-xs text-surface-400 text-center">{row[0]}</div>
                            </div>
                            {/* Cell: Name */}
                            <div
                                className="flex items-center px-4 py-3.5 border-r border-b border-surface-800 flex-shrink-0 text-surface-200"
                                style={{
                                    width: "240px",
                                    textAlign: "left"
                                }}>
                                <div className="truncate w-full">{row[1]}</div>
                            </div>
                            {/* Cell: Category */}
                            <div
                                className="flex items-center px-4 py-3.5 border-r border-b border-surface-800 flex-shrink-0"
                                style={{
                                    width: "220px",
                                    textAlign: "left"
                                }}>
                                <span
                                    className={`rounded-lg max-w-full w-max h-fit font-medium inline-flex gap-1 text-ellipsis items-center px-3 py-1.5 text-sm overflow-hidden ${categoryColors[index % categoryColors.length]}`}>{row[2]}</span>
                            </div>
                            {/* Cell: Price */}
                            <div
                                className="flex items-center justify-end px-4 py-3.5 border-r border-b border-surface-800 flex-shrink-0 text-surface-200"
                                style={{
                                    width: "160px",
                                    textAlign: "right"
                                }}>
                                <div className="truncate">{row[3]}</div>
                            </div>
                            {/* Cell: Currency */}
                            <div
                                className="flex items-center px-4 py-3.5 border-r border-b border-surface-800 flex-shrink-0"
                                style={{
                                    width: "140px",
                                    textAlign: "left"
                                }}>
                                <span
                                    className="rounded-lg max-w-full w-max h-fit font-medium inline-flex gap-1 text-ellipsis items-center px-3 py-1.5 text-sm overflow-hidden bg-sky-950 text-sky-200">{row[4]}</span>
                            </div>
                            {/* Placeholder Cell */}
                            <div className="w-20 flex-shrink-0 border-b border-surface-800"/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const usersData = [
    ["user_001", "Sarah Chen", "sarah.chen@example.com", "2025-10-15", "Active"],
    ["user_002", "Marcus Johnson", "marcus.j@example.com", "2025-10-08", "Active"],
    ["user_003", "Aisha Patel", "aisha.patel@example.com", "2025-09-28", "Active"]
];

const statusColors: Record<string, string> = {
    "Active": "bg-green-950 text-green-200",
    "Inactive": "bg-gray-950 text-gray-200",
    "Pending": "bg-yellow-950 text-yellow-200"
};

export function UsersDemoTable() {
    return (
        <div
            className="h-full w-full flex flex-col rounded-xl border border-surface-800 bg-surface-950/70 backdrop-blur-sm shadow-lg shadow-black/20">
            {/* Header Toolbar Section */}
            <div
                className="min-h-[48px] px-4 md:px-6 py-2 flex flex-row items-center justify-between w-full flex-shrink-0 bg-surface-950/60 border-b border-surface-800 rounded-t-xl">
                {/* Left Side: Title */}
                <div className="flex gap-4 md:mr-8 mr-4 self-stretch items-center">
                    <div className="hidden lg:block">
                        <div className="flex flex-col items-start justify-center">
                            <div
                                className="text-sm font-medium leading-none truncate max-w-[160px] lg:max-w-[240px] text-white">Users
                            </div>
                            <div
                                className="text-xs text-surface-400 w-full text-ellipsis overflow-hidden whitespace-nowrap max-w-xs text-left">{usersData.length} entities
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Side: Search and Action Buttons */}
                <div className="flex items-center gap-3">
                    <div
                        className="relative h-[32px] bg-surface-900/70 border border-surface-800 rounded-md flex items-center">
                        <div
                            className="absolute p-0 px-3 h-full pointer-events-none flex items-center justify-center top-0 left-0">
                            <span className="material-icons text-surface-500 text-xl">search</span>
                        </div>
                        <input placeholder="Search" readOnly
                               className="pointer-events-none placeholder-surface-500 bg-transparent outline-none border-none pl-10 h-full text-surface-200 w-[150px]"
                               value=""/>
                    </div>
                    <button type="button" title="Download"
                            className="cursor-pointer text-surface-300 inline-flex items-center justify-center p-2 text-sm hover:bg-surface-900 rounded-full w-9 h-9">
                        <span className="material-icons text-xl">download</span>
                    </button>
                </div>
            </div>

            {/* Main Table Area */}
            <div className="flex-grow overflow-x-auto overflow-y-hidden">
                {/* Sticky Header Row */}
                <div
                    className="sticky top-0 z-10 flex flex-row w-fit min-w-full border-b border-surface-800 bg-gradient-to-b from-surface-950 to-surface-900/60 min-h-[52px]">
                    {/* Header Cell: ID */}
                    <div
                        className="flex px-4 py-3.5 h-full text-xs uppercase font-semibold select-none items-center text-surface-300 hover:text-surface-200 hover:bg-surface-900/60 relative"
                        style={{
                            minWidth: "140px",
                            maxWidth: "140px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-center">
                            <div className="truncate mx-1">ID</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-surface-700/60 opacity-50"></div>
                    </div>
                    {/* Header Cell: Name */}
                    <div
                        className="flex px-4 py-3.5 h-full text-xs uppercase font-semibold select-none items-center text-surface-300 hover:text-surface-200 hover:bg-surface-900/60 relative"
                        style={{
                            minWidth: "200px",
                            maxWidth: "200px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-start">
                            <span className="material-icons mr-2 text-xl" style={{ fontSize: "20px" }}>person</span>
                            <div className="truncate mx-1">Name</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-surface-700/60 opacity-50"></div>
                    </div>
                    {/* Header Cell: Email */}
                    <div
                        className="flex px-4 py-3.5 h-full text-xs uppercase font-semibold select-none items-center text-surface-300 hover:text-surface-200 hover:bg-surface-900/60 relative"
                        style={{
                            minWidth: "240px",
                            maxWidth: "240px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-start">
                            <span className="material-icons mr-2 text-xl" style={{ fontSize: "20px" }}>email</span>
                            <div className="truncate mx-1">Email</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-surface-700/60 opacity-50"></div>
                    </div>
                    {/* Header Cell: Created At */}
                    <div
                        className="flex px-4 py-3.5 h-full text-xs uppercase font-semibold select-none items-center text-surface-300 hover:text-surface-200 hover:bg-surface-900/60 relative"
                        style={{
                            minWidth: "180px",
                            maxWidth: "180px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-start">
                            <span className="material-icons mr-2 text-xl">calendar_today</span>
                            <div className="truncate mx-1">Created At</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-surface-700/60 opacity-50"></div>
                    </div>
                    {/* Header Cell: Status */}
                    <div
                        className="flex px-4 py-3.5 h-full text-xs uppercase font-semibold select-none items-center text-surface-300 hover:text-surface-200 hover:bg-surface-900/60 relative"
                        style={{
                            minWidth: "140px",
                            maxWidth: "140px"
                        }}>
                        <div className="overflow-hidden flex-grow flex items-center justify-start">
                            <span className="material-icons mr-2 text-xl" style={{ fontSize: "20px" }}>toggle_on</span>
                            <div className="truncate mx-1">Status</div>
                        </div>
                        <div
                            className="absolute h-full w-[6px] top-0 right-0 cursor-col-resize bg-transparent hover:bg-surface-700/60 opacity-50"></div>
                    </div>
                    {/* Add Column Button Placeholder */}
                    <div
                        className="p-0.5 w-20 h-full flex items-center justify-center cursor-pointer bg-surface-950 hover:bg-surface-900/60 flex-shrink-0">
                        <span className="material-icons text-xl text-surface-400"
                              style={{ fontSize: "20px" }}>add</span>
                    </div>
                </div>

                {/* Data Rows */}
                <div className="w-fit min-w-full">
                    {usersData.map((row, index) => (
                        <div key={row[0]}
                             className="flex items-stretch text-sm leading-none even:bg-transparent odd:bg-surface-950/40 hover:bg-surface-900/40 transition-colors">
                            {/* Cell: ID */}
                            <div
                                className="flex items-center justify-center px-4 py-3.5 border-r border-b border-surface-800 bg-surface-950 flex-shrink-0"
                                style={{ width: "140px" }}>
                                <div
                                    className="w-full overflow-hidden truncate font-mono text-xs text-surface-400 text-center">{row[0]}</div>
                            </div>
                            {/* Cell: Name */}
                            <div
                                className="flex items-center px-4 py-3.5 border-r border-b border-surface-800 flex-shrink-0 text-surface-200"
                                style={{
                                    width: "200px",
                                    textAlign: "left"
                                }}>
                                <div className="truncate w-full">{row[1]}</div>
                            </div>
                            {/* Cell: Email */}
                            <div
                                className="flex items-center px-4 py-3.5 border-r border-b border-surface-800 flex-shrink-0 text-surface-200"
                                style={{
                                    width: "240px",
                                    textAlign: "left"
                                }}>
                                <div className="truncate w-full">{row[2]}</div>
                            </div>
                            {/* Cell: Created At */}
                            <div
                                className="flex items-center px-4 py-3.5 border-r border-b border-surface-800 flex-shrink-0 text-surface-200"
                                style={{
                                    width: "180px",
                                    textAlign: "left"
                                }}>
                                <div className="truncate w-full">{row[3]}</div>
                            </div>
                            {/* Cell: Status */}
                            <div
                                className="flex items-center px-4 py-3.5 border-r border-b border-surface-800 flex-shrink-0"
                                style={{
                                    width: "140px",
                                    textAlign: "left"
                                }}>
                                <span
                                    className={`rounded-lg max-w-full w-max h-fit font-medium inline-flex gap-1 text-ellipsis items-center px-3 py-1.5 text-sm overflow-hidden ${statusColors[row[4]]}`}>{row[4]}</span>
                            </div>
                            {/* Placeholder Cell */}
                            <div className="w-20 flex-shrink-0 border-b border-surface-800"/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
