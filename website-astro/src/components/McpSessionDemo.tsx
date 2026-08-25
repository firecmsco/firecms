import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

/**
 * Beat 2 of the homepage showcase: "or let an agent set it up".
 *
 * Cause on the left, effect on the right: the agent's MCP session beside the
 * project it is building. Collections land in the CMS as `setup_all_collections`
 * reports them, which is the whole claim of the beat — you watch the thing
 * assemble itself.
 *
 * Every tool name and result is real. They come from @firecms/mcp-server's
 * onboarding flow (list_firebase_projects → connect_project_to_firecms →
 * setup_all_collections); nothing here is invented.
 *
 * Autoplay only — no pointer events.
 */

type Line =
    | { kind: "prompt"; text: string }
    | { kind: "tool"; name: string; results: string[] }
    | { kind: "done"; text: string };

const SCRIPT: Line[] = [
    {
        kind: "prompt",
        text: "Connect my Firebase project to FireCMS and build the collections from what's already in Firestore."
    },
    {
        kind: "tool",
        name: "list_firebase_projects",
        results: ["3 projects found", "my-shop-prod — ready to connect"]
    },
    {
        kind: "tool",
        name: "connect_project_to_firecms",
        results: ["service account created", "Firestore + Storage rules applied"]
    },
    {
        kind: "tool",
        name: "setup_all_collections",
        results: [
            "sampled 6 root collections",
            "products · orders · users",
            "categories · reviews · pages"
        ]
    },
    { kind: "done", text: "6 collections inferred from live data. Your team can start editing." }
];

/** Index of the tool call that creates the collections. */
const SETUP_STEP = 3;

const ICONS: Record<string, React.ReactNode> = {
    cart: <><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.4 12h11L21 7H6"/></>,
    receipt: <><path d="M5 3v18l2.5-1.6L10 21l2.5-1.6L15 21l2.5-1.6L20 21V3z"/><path d="M9 8h7M9 12h7"/></>,
    person: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></>,
    tag: <><path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1.5"/></>,
    star: <polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3"/>,
    page: <><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h6"/></>
};

const COLLECTIONS = [
    { id: "products", name: "Products", icon: "cart", props: 14, docs: "256" },
    { id: "orders", name: "Orders", icon: "receipt", props: 9, docs: "1,204" },
    { id: "users", name: "Users", icon: "person", props: 7, docs: "392" },
    { id: "categories", name: "Categories", icon: "tag", props: 4, docs: "18" },
    { id: "reviews", name: "Reviews", icon: "star", props: 6, docs: "874" },
    { id: "pages", name: "Pages", icon: "page", props: 5, docs: "12" }
];

const CHEVRON = (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 18 15 12 9 6"/>
    </svg>
);

const CHECK = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);

export default function McpSessionDemo({ height = 520 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [step, setStep] = useState(0);
    const [subStep, setSubStep] = useState(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clear = () => {
        if (timer.current) clearTimeout(timer.current);
    };

    useEffect(() => {
        clear();
        if (!inView) return clear;

        if (step === 0) {
            timer.current = setTimeout(() => setStep(1), 1100);
            return clear;
        }

        const entry = SCRIPT[step];
        if (!entry) {
            timer.current = setTimeout(() => {
                setStep(0);
                setSubStep(0);
            }, 4200);
            return clear;
        }

        if (entry.kind === "tool") {
            if (subStep < entry.results.length) {
                timer.current = setTimeout(() => setSubStep(s => s + 1), 460);
            } else {
                timer.current = setTimeout(() => {
                    setStep(s => s + 1);
                    setSubStep(0);
                }, 460);
            }
            return clear;
        }

        timer.current = setTimeout(() => setStep(s => s + 1), 1100);
        return clear;
    }, [step, subStep, inView]);

    const connected = step > 2;
    // Collections land three at a time, in step with the tool's own result lines.
    const shown = step > SETUP_STEP
        ? COLLECTIONS.length
        : step === SETUP_STEP
            ? Math.max(0, (subStep - 1) * 3)
            : 0;

    const prompt = SCRIPT[0] as Extract<Line, { kind: "prompt" }>;

    return (
        <div
            ref={ref}
            className="flex w-full select-none overflow-hidden rounded-2xl border border-surface-800 bg-[#0c0e12] font-sans text-[13px] text-surface-300"
            style={{ height }}
            aria-label="An AI assistant setting up FireCMS over MCP, beside the project it builds"
        >
            {/* Left: the session */}
            <div className="flex w-[520px] shrink-0 flex-col border-r border-surface-800">
                <div className="flex shrink-0 items-center gap-2.5 border-b border-surface-800 px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"/>
                    <span className="text-[11px] font-medium uppercase tracking-[0.13em] text-surface-500">firecms · mcp</span>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-hidden p-5">
                    <div className="flex gap-3">
                        <span className="mt-[3px] shrink-0 text-[11px] font-semibold uppercase tracking-wider text-surface-600">You</span>
                        <p className="max-w-[42ch] leading-6 text-surface-100">{prompt.text}</p>
                    </div>

                    <div className="space-y-3">
                        {SCRIPT.map((entry, i) => {
                            if (entry.kind !== "tool" || i > step) return null;
                            const visible = i < step ? entry.results.length : subStep;
                            return (
                                <div key={entry.name} className="flex gap-3">
                                    <span className="mt-[5px] shrink-0 text-primary">{CHEVRON}</span>
                                    <div className="min-w-0">
                                        <code className="font-mono text-[12.5px] text-surface-100">{entry.name}</code>
                                        <div className="mt-1 space-y-1">
                                            {entry.results.slice(0, visible).map(r => (
                                                <div key={r} className="flex items-center gap-2 text-[12.5px] text-surface-500">
                                                    <span className="h-px w-3 bg-surface-700"/>
                                                    {r}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {step >= SCRIPT.length - 1 && (
                        <div className="flex items-start gap-3 pt-1">
                            <span className="mt-[3px] shrink-0 text-emerald-400">{CHECK}</span>
                            <p className="max-w-[42ch] leading-6 text-surface-200">
                                {(SCRIPT[SCRIPT.length - 1] as Extract<Line, { kind: "done" }>).text}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: the project being built */}
            <div className="flex min-w-0 flex-1 flex-col bg-surface-950/50">
                <div className="flex shrink-0 items-center gap-2.5 border-b border-surface-800 px-4 py-3">
                    <svg width="16" height="16" viewBox="0 0 583 583" fill="none" aria-hidden="true">
                        <circle cx="291.5" cy="291.5" r="291.5" fill="#0070F4"/>
                        <ellipse cx="292" cy="291.5" rx="173" ry="173.5" fill="#FF3773"/>
                        <path d="M465 291.5C465 268.847 460.525 246.416 451.831 225.487C443.137 204.558 430.394 185.542 414.329 169.524C398.265 153.506 379.194 140.8 358.204 132.131C337.215 123.462 314.719 119 292 119C269.281 119 246.785 123.462 225.796 132.131C204.806 140.8 185.735 153.506 169.671 169.524C153.606 185.542 140.863 204.558 132.169 225.487C123.475 246.416 119 268.847 119 291.5L292 291.5H465Z" fill="#FFA400"/>
                    </svg>
                    <span className="font-mono text-[12px] text-surface-300">my-shop-prod</span>
                    <span
                        className={
                            "ml-auto rounded-full px-2 py-0.5 text-[10.5px] font-medium transition-colors duration-500 " +
                            (connected ? "bg-emerald-500/15 text-emerald-400" : "bg-surface-800 text-surface-500")
                        }
                    >
                        {connected ? "Connected" : "Not connected"}
                    </span>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden p-5">
                    <div className="mb-3 flex items-baseline gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.11em] text-surface-500">Collections</span>
                        <span className="font-mono text-[11px] tabular-nums text-surface-600">{shown} / 6</span>
                    </div>

                    {shown === 0 && (
                        <div className="flex h-[70%] items-center justify-center rounded-xl border border-dashed border-surface-800">
                            <span className="text-[12.5px] text-surface-600">
                                {connected ? "Inferring collections from live data…" : "Waiting for the agent"}
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        {COLLECTIONS.slice(0, shown).map((c, i) => (
                            <div
                                key={c.id}
                                className="flex items-center gap-3 rounded-lg border border-surface-800 bg-surface-900/60 px-3 py-2.5"
                                style={{ animation: "cfd-land 420ms cubic-bezier(0.16,1,0.3,1) backwards", animationDelay: `${(i % 3) * 90}ms` }}
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        {ICONS[c.icon]}
                                    </svg>
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[13px] text-surface-100">{c.name}</span>
                                    <span className="block truncate font-mono text-[10.5px] text-surface-600">
                                        {c.props} properties · {c.docs} docs
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <style>{`@keyframes cfd-land { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
            </div>
        </div>
    );
}
