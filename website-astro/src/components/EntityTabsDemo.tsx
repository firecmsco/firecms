import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";
import {
    Icon, PROPERTY_CONFIGS, TextFieldWithLabel, Typography, cls, defaultBorderMixin,
    useMaterialIcons
} from "./firecms/ui";

/**
 * One document, two renderings: the generated form and a custom React view
 * mounted beside it as a tab.
 *
 * Chrome transcribed from packages/firecms_core/src/core/EntityEditView.tsx —
 * an h-14 bar over `bg-surface-50 dark:bg-surface-900` carrying secondary-mode
 * Tabs (packages/ui/src/components/Tabs.tsx: `border-b-2 border-transparent
 * -mb-px`, active `border-b-primary text-primary`), then the form centred in a
 * max-w-4xl column. Fields follow TextField at size "large" with a
 * LabelWithIcon, as PropertyFieldBinding renders them.
 *
 * The custom view's contents are deliberately not FireCMS's — that is the whole
 * point of the tab — but its frame and type scale are.
 *
 * Autoplay only — no pointer events.
 */

const IMAGE = "https://firebasestorage.googleapis.com/v0/b/firecms-demo-27150.appspot.com/o/dadaki%2FB000ZHY0JK-2047853797.jpg?alt=media&token=9e609a03-5866-4bd3-919b-7f40e599f7e0";

const TABS = ["Product", "Storefront"] as const;

export default function EntityTabsDemo({ height = 520 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [tab, setTab] = useState(0);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useMaterialIcons();

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        timer.current = setTimeout(() => setTab(t => (t + 1) % TABS.length), 3400);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [tab, inView]);

    return (
        <div ref={ref}
             className="relative flex w-full select-none flex-col overflow-hidden rounded-2xl border border-surface-800 bg-white dark:bg-surface-900"
             style={{ height }}
             aria-label="A product document in FireCMS, shown by the generated form and by a custom React view mounted as a tab">

            {/* EntityEditView top bar */}
            <div className={cls("h-14 items-center overflow-hidden w-full border-b pl-2 pr-2 flex gap-2",
                "bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>
                <span className="rounded-full inline-flex items-center justify-center w-10 h-10 p-2 text-surface-accent-600 dark:text-surface-accent-300">
                    <Icon icon={"close"}/>
                </span>
                <Typography variant={"caption"} color={"secondary"} className={"font-mono truncate"}>
                    products/B000ZHY0JK
                </Typography>
                <div className={"flex-grow"}/>
                <div className="inline-flex items-center">
                    <span className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium border-b-2 border-transparent -mb-px text-surface-500">
                        <Icon icon={"code"} size={"small"}/>
                    </span>
                    {TABS.map((t, i) => (
                        <span key={t}
                              className={cls(
                                  "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-200",
                                  i === 0 && "min-w-[120px]",
                                  i === tab ? "border-b-primary text-primary" : "border-transparent text-text-secondary dark:text-text-secondary-dark")}>
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {/* The view for the selected tab */}
            <div key={tab} className="tab-in flex-1 flex flex-row w-full overflow-hidden justify-center">
                {tab === 0 ? (
                    <div className="relative flex flex-col w-full h-fit max-w-4xl px-6 py-6 gap-4">
                        <TextFieldWithLabel
                            label={"Name"}
                            icon={{ icon: PROPERTY_CONFIGS.text_field.icon, color: PROPERTY_CONFIGS.text_field.color }}
                            value={"Aviator RB 3025"}/>
                        <TextFieldWithLabel
                            label={"Price"}
                            icon={{ icon: PROPERTY_CONFIGS.number_input.icon, color: PROPERTY_CONFIGS.number_input.color }}
                            value={"115"}/>
                        <TextFieldWithLabel
                            label={"Description"}
                            icon={{ icon: PROPERTY_CONFIGS.markdown.icon, color: PROPERTY_CONFIGS.markdown.color }}
                            value={"Unisex Sunglasses, Gold, 58 mm. Iconic, timeless style."}/>
                    </div>
                ) : (
                    /* A custom React view for the same entity. */
                    <div className="relative flex w-full h-full max-w-4xl px-6 py-6">
                        <div className={cls("flex w-full gap-6 rounded-lg border p-5 bg-white dark:bg-surface-950", defaultBorderMixin)}>
                            <img src={IMAGE} alt="" loading="lazy"
                                 className="h-full w-[38%] shrink-0 rounded-lg object-contain bg-white"/>
                            <div className="flex min-w-0 flex-col">
                                <div className="flex items-baseline justify-between gap-3">
                                    <Typography variant={"h5"} className={"truncate"}>Aviator RB 3025</Typography>
                                    <Typography variant={"h5"} className={"shrink-0"}>€115</Typography>
                                </div>
                                <div className="mt-2 flex gap-0.5 text-primary" aria-hidden="true">
                                    {[0, 1, 2, 3, 4].map(i => <Icon key={i} icon={i < 4 ? "star" : "star_half"} size={"small"}/>)}
                                </div>
                                <Typography variant={"body1"} color={"secondary"} className={"mt-3 line-clamp-3"}>
                                    Unisex Sunglasses, Gold, 58 mm. These iconic sunglasses are known
                                    for their timeless style and exceptional construction.
                                </Typography>
                                <div className="mt-auto pt-4">
                                    <Typography variant={"label"} color={"secondary"} className={"uppercase tracking-wider block mb-1.5"}>
                                        Rendered by your component
                                    </Typography>
                                    <Typography variant={"caption"} color={"disabled"} className={"font-mono block"}>
                                        &lt;StorefrontPreview entity={"{entity}"} /&gt;
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @media (prefers-reduced-motion: no-preference) {
                    .tab-in { animation: et-in 260ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
                }
                @keyframes et-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: none; } }
            `}</style>
        </div>
    );
}
