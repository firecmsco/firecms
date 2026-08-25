import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

/**
 * A document open in the side panel over its collection: the form on the left,
 * a live preview of the rendered result on the right. The title is edited in
 * the form and the preview follows it, which is the whole point of the panel.
 *
 * Autoplay only — no pointer events.
 */

const TITLES = [
    "Post about sunglasses",
    "Summer lookbook 2026",
    "How we pick our fabrics"
];

const BODY =
    "Sunglasses are a form of protective eyewear designed to prevent bright sunlight and high-energy visible light from damaging the eyes.";

export default function SidePanelPreviewDemo({ height = 470 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [index, setIndex] = useState(0);
    const [typed, setTyped] = useState(TITLES[0]);
    const [phase, setPhase] = useState<"settled" | "clearing" | "typing">("settled");
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;

        if (phase === "settled") {
            timer.current = setTimeout(() => setPhase("clearing"), 3000);
        } else if (phase === "clearing") {
            if (typed.length > 0) {
                timer.current = setTimeout(() => setTyped(t => t.slice(0, Math.max(0, t.length - 6))), 22);
            } else {
                setIndex(i => (i + 1) % TITLES.length);
                setPhase("typing");
            }
        } else {
            const target = TITLES[index];
            if (typed.length < target.length) {
                timer.current = setTimeout(() => setTyped(target.slice(0, typed.length + 2)), 48);
            } else {
                setPhase("settled");
            }
        }

        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [phase, typed, index, inView]);

    const showCaret = phase !== "settled";

    return (
        <div
            ref={ref}
            className="relative flex w-full select-none overflow-hidden rounded-2xl border border-surface-800 bg-[#0c0e12] font-sans text-[13px]"
            style={{ height }}
            aria-label="A blog entry open in the FireCMS side panel, with the form on the left and a live preview of the rendered post on the right"
        >
            {/* The collection, still there underneath */}
            <div className="hidden w-[86px] shrink-0 flex-col gap-2 border-r border-surface-800 bg-surface-950/70 p-3 opacity-45 sm:flex" aria-hidden="true">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-600">Blog</span>
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <span key={i} className="h-3.5 rounded bg-surface-800"/>
                ))}
            </div>

            {/* The panel */}
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex shrink-0 items-center justify-between border-b border-surface-800 px-4 py-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.13em] text-surface-500">Blog entry</span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.13em] text-primary">Preview</span>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
                    {/* Form */}
                    <div className="min-h-0 space-y-3.5 overflow-hidden border-surface-800 p-4 lg:border-r">
                        <div>
                            <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-surface-500">Title</span>
                            <div className="rounded-lg border border-surface-700 bg-surface-900/60 px-3 py-2 text-surface-100">
                                <span className="break-words">{typed}</span>
                                {showCaret && <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-primary"/>}
                            </div>
                        </div>

                        <div>
                            <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-surface-500">Header image</span>
                            <div className="flex items-center gap-3 rounded-lg border border-dashed border-surface-700 bg-surface-900/40 p-2.5">
                                <span
                                    className="h-11 w-11 shrink-0 rounded ring-1 ring-inset ring-white/10"
                                    style={{ background: "linear-gradient(140deg, hsl(186 46% 44%), hsl(206 40% 24%))" }}
                                    aria-hidden="true"
                                />
                                <span className="text-[12px] leading-4 text-surface-500">
                                    Drop a file, or click to select one
                                </span>
                            </div>
                        </div>

                        <div>
                            <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-surface-500">Content</span>
                            <div className="space-y-1.5 rounded-lg border border-surface-700 bg-surface-900/50 p-2.5">
                                <span className="inline-block rounded bg-emerald-500/15 px-2 py-0.5 text-[10.5px] font-medium text-emerald-400">
                                    Text block
                                </span>
                                <p className="line-clamp-2 text-[12px] leading-5 text-surface-400">{BODY}</p>
                            </div>
                        </div>
                    </div>

                    {/* Live preview */}
                    <div className="hidden min-h-0 flex-col overflow-hidden bg-surface-950/60 lg:flex">
                        <div
                            className="h-[38%] w-full shrink-0"
                            style={{ background: "linear-gradient(140deg, hsl(186 46% 44%), hsl(206 40% 24%))" }}
                            aria-hidden="true"
                        />
                        <div className="min-h-0 p-4">
                            <h4 className="min-h-[1.3em] text-[17px] font-bold leading-tight text-white">
                                {typed}
                            </h4>
                            <p className="mt-2.5 line-clamp-4 text-[12px] leading-5 text-surface-400">{BODY}</p>
                        </div>
                    </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-3 border-t border-surface-800 px-4 py-2.5">
                    <span className="text-[12px] font-medium text-surface-500">Discard</span>
                    <span className="rounded-md bg-primary px-3.5 py-1.5 text-[12px] font-semibold text-white">Save</span>
                </div>
            </div>
        </div>
    );
}
