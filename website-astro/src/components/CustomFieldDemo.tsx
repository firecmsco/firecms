import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";
import { Chip, Icon, PropertyConfigBadge, Typography, useMaterialIcons } from "./firecms/ui";

/**
 * Beat 4 of the homepage showcase: "you extend it in React".
 *
 * Two custom fields as overlapping cards, so the point reads as a category
 * rather than a one-off. The right card runs into the section's bleed on
 * purpose — its readable content (city, coordinates, stored value) stays left
 * of the fold.
 *
 * The body-parts picker is ported from the real component — hotspot zones,
 * muscle-group enum and the front/back renders all come from
 * `app/frontend/src/BodyPartsField.tsx` and its website demo in the Rebase
 * repo, which is the same field MedicalMotion's therapists use. Zone
 * percentages are theirs; do not re-derive them by eye.
 *
 * The location field is a drawn map of Barcelona — the Eixample grid on its
 * real 45° bearing, the Diagonal cutting across it, Ciutadella and the coast —
 * with the pin projected from each store's actual latitude and longitude. There
 * is deliberately no map in the built-in geopoint field (it renders two number
 * inputs, because a tile provider means an API key and a network dependency),
 * which is exactly why a map is the thing you bring your own component for.
 *
 * Autoplay only — no pointer events.
 */

/** Hotspot zones, as percentages of the body render. From the real field. */
const HOTSPOT_ZONES: Record<string, { top: number; left: number; width: number; height: number; view: "front" | "back" }[]> = {
    head_neck: [{ top: 4, left: 42, width: 16, height: 15, view: "front" }],
    shoulders: [
        { top: 19, left: 36, width: 10, height: 6, view: "front" },
        { top: 19, left: 54, width: 10, height: 6, view: "front" }
    ],
    chest: [{ top: 23, left: 37, width: 26, height: 10, view: "front" }],
    biceps: [
        { top: 26, left: 33, width: 6, height: 10, view: "front" },
        { top: 26, left: 61, width: 6, height: 10, view: "front" }
    ],
    triceps: [
        { top: 26, left: 33, width: 7, height: 10, view: "back" },
        { top: 26, left: 60, width: 7, height: 10, view: "back" }
    ],
    forearms: [
        { top: 37, left: 29, width: 8, height: 13, view: "front" },
        { top: 37, left: 63, width: 8, height: 13, view: "front" }
    ],
    abs: [{ top: 33, left: 43, width: 14, height: 12, view: "front" }],
    obliques: [
        { top: 33, left: 36, width: 8, height: 10, view: "front" },
        { top: 33, left: 56, width: 8, height: 10, view: "front" }
    ],
    upper_back: [{ top: 20, left: 38, width: 24, height: 14, view: "back" }],
    lower_back: [{ top: 34, left: 40, width: 20, height: 10, view: "back" }],
    hip_flexors: [{ top: 44, left: 40, width: 20, height: 7, view: "front" }],
    glutes: [{ top: 44, left: 40, width: 20, height: 10, view: "back" }],
    quads: [
        { top: 51, left: 39, width: 10, height: 16, view: "front" },
        { top: 51, left: 51, width: 10, height: 16, view: "front" }
    ],
    hamstrings: [
        { top: 54, left: 40, width: 10, height: 12, view: "back" },
        { top: 54, left: 50, width: 10, height: 12, view: "back" }
    ],
    calves: [
        { top: 68, left: 40, width: 8, height: 16, view: "front" },
        { top: 68, left: 52, width: 8, height: 16, view: "front" }
    ]
};

const ENUM_ENTRIES = [
    { id: "head_neck", label: "Head & Neck" },
    { id: "shoulders", label: "Shoulders" },
    { id: "chest", label: "Chest" },
    { id: "biceps", label: "Biceps" },
    { id: "triceps", label: "Triceps" },
    { id: "forearms", label: "Forearms" },
    { id: "abs", label: "Abs" },
    { id: "obliques", label: "Obliques" },
    { id: "upper_back", label: "Upper Back" },
    { id: "lower_back", label: "Lower Back" },
    { id: "hip_flexors", label: "Hip Flexors" },
    { id: "glutes", label: "Glutes" },
    { id: "quads", label: "Quads" },
    { id: "hamstrings", label: "Hamstrings" },
    { id: "calves", label: "Calves" }
];

/** Map viewBox, and the lat/lon window it covers. */
const MAP_W = 340;
const MAP_H = 270;
const LON = [2.135, 2.200] as const;
const LAT = [41.412, 41.374] as const;

const project = (lat: number, lon: number) => ({
    x: ((lon - LON[0]) / (LON[1] - LON[0])) * MAP_W,
    y: ((LAT[0] - lat) / (LAT[0] - LAT[1])) * MAP_H
});

/** Real Barcelona neighbourhoods; the pin is projected from these. */
const STEPS = [
    { parts: ["chest", "triceps", "abs"], place: "Gràcia", lat: 41.4036, lon: 2.1588 },
    { parts: ["quads", "glutes", "calves"], place: "Eixample", lat: 41.3915, lon: 2.1650 },
    { parts: ["shoulders", "biceps", "forearms"], place: "El Born", lat: 41.3850, lon: 2.1830 },
    { parts: ["upper_back", "lower_back"], place: "Barceloneta", lat: 41.3797, lon: 2.1925 }
];

/**
 * The source renders are 1024² but the figure only occupies ~49% of the width,
 * so half of each image was empty margin. These are cropped to the content box;
 * the zone percentages above are still the originals, remapped here by the same
 * transform rather than re-measured.
 */
const CROP = { x: 250, y: 26, w: 524, h: 972, src: 1024 };

const remap = (z: { top: number; left: number; width: number; height: number }) => ({
    left: (((z.left / 100) * CROP.src - CROP.x) / CROP.w) * 100,
    top: (((z.top / 100) * CROP.src - CROP.y) / CROP.h) * 100,
    width: (((z.width / 100) * CROP.src) / CROP.w) * 100,
    height: (((z.height / 100) * CROP.src) / CROP.h) * 100
});

function BodyView({ view, src, selected }: { view: "front" | "back"; src: string; selected: string[] }) {
    return (
        <div className="relative h-full" style={{ aspectRatio: "524 / 972" }}>
            <img
                src={src}
                width={524}
                height={972}
                alt={`Body ${view} view`}
                draggable={false}
                loading="lazy"
                decoding="async"
                className="block h-full w-full select-none object-contain opacity-50 invert brightness-125"
            />
            {ENUM_ENTRIES.map(entry => {
                const zones = HOTSPOT_ZONES[entry.id];
                if (!zones) return null;
                return zones
                    .filter(z => z.view === view)
                    .map((zone, i) => {
                        const z = remap(zone);
                        return (
                            <div
                                key={`${entry.id}-${view}-${i}`}
                                className={
                                    "absolute rounded-md outline outline-2 transition-all duration-300 " +
                                    (selected.includes(entry.id) ? "bg-primary/30 outline-primary/70" : "outline-transparent")
                                }
                                style={{
                                    top: `${z.top}%`,
                                    left: `${z.left}%`,
                                    width: `${z.width}%`,
                                    height: `${z.height}%`,
                                    zIndex: 2
                                }}
                            />
                        );
                    });
            })}
        </div>
    );
}

/** Barcelona, drawn: the Eixample grid, the Diagonal, Ciutadella, the coast. */
function BarcelonaMap() {
    const blocks: React.ReactNode[] = [];
    // The Eixample is a regular grid on a ~45° bearing — that regularity is the
    // one thing that makes the city instantly recognisable, so draw it as such.
    for (let i = -14; i <= 22; i++) {
        blocks.push(<line key={`a${i}`} x1={i * 26} y1={-120} x2={i * 26} y2={400} stroke="#2b3138" strokeWidth="7"/>);
    }
    for (let j = -8; j <= 20; j++) {
        blocks.push(<line key={`b${j}`} x1={-160} y1={j * 26} x2={480} y2={j * 26} stroke="#2b3138" strokeWidth="7"/>);
    }

    return (
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
                <clipPath id="cfd-map-clip">
                    <rect width={MAP_W} height={MAP_H}/>
                </clipPath>
            </defs>

            <g clipPath="url(#cfd-map-clip)">
                {/* land */}
                <rect width={MAP_W} height={MAP_H} fill="#181b1f"/>

                {/* Collserola hillside, top-left */}
                <path d="M0 0 L120 0 C86 34 44 52 0 62 Z" fill="#1a2620"/>

                {/* Eixample grid, on its real bearing */}
                <g transform={`rotate(-45 ${MAP_W / 2} ${MAP_H / 2})`} opacity="0.85">
                    {blocks}
                </g>

                {/* Ciutadella park */}
                <path d="M232 176 C252 168 274 176 278 194 C282 214 262 226 242 220 C226 214 220 190 232 176 Z" fill="#1d3326"/>

                {/* Avinguda Diagonal — the one street that ignores the grid */}
                <path d="M-10 44 L350 214" stroke="#3c444c" strokeWidth="9" strokeLinecap="round"/>
                <path d="M-10 44 L350 214" stroke="#4b545e" strokeWidth="2" strokeLinecap="round"/>

                {/* Gran Via */}
                <path d="M-10 150 C90 140 200 172 350 150" stroke="#39414a" strokeWidth="7" strokeLinecap="round"/>

                {/* Ronda Litoral, hugging the shore */}
                <path d="M96 270 C150 236 214 216 300 208 L350 200" stroke="#5a4d2c" strokeWidth="6" strokeLinecap="round"/>

                {/* Mediterranean */}
                <path d="M120 270 C176 240 240 224 340 214 L340 270 Z" fill="#132a42"/>
                <path d="M120 270 C176 240 240 224 340 214" fill="none" stroke="#20486e" strokeWidth="1.4"/>

                {/* Port basin */}
                <path d="M150 258 C176 246 200 240 224 238 L228 252 C204 254 178 262 158 268 Z" fill="#16324e"/>

                {/* labels */}
                <g fill="#7b848f" fontSize="8" fontFamily="ui-sans-serif, system-ui, sans-serif" letterSpacing="0.4">
                    <text x="86" y="66">GRÀCIA</text>
                    <text x="120" y="150">L'EIXAMPLE</text>
                    <text x="228" y="166">EL BORN</text>
                    <text x="268" y="240" fill="#4d6b8c">MEDITERRANI</text>
                </g>
                <g fill="#6d7681" fontSize="7" fontFamily="ui-sans-serif, system-ui, sans-serif">
                    <text x="196" y="120" transform="rotate(25 196 120)">Av. Diagonal</text>
                </g>
            </g>
        </svg>
    );
}

export default function CustomFieldDemo({ height = 520 }: { height?: number | string }) {
    const { ref, inView } = useInView<HTMLDivElement>();
    useMaterialIcons();
    const [step, setStep] = useState(0);
    const [revealed, setRevealed] = useState(STEPS[0].parts.length);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const current = STEPS[step];
    const selected = current.parts.slice(0, revealed);
    const pin = project(current.lat, current.lon);

    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        if (!inView) return;
        if (revealed < current.parts.length) {
            timer.current = setTimeout(() => setRevealed(n => n + 1), 560);
        } else {
            timer.current = setTimeout(() => {
                setStep(s => (s + 1) % STEPS.length);
                setRevealed(0);
            }, 2800);
        }
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [revealed, step, current.parts.length, inView]);

    const cardBase =
        "flex flex-col overflow-hidden rounded-2xl border border-surface-800 bg-surface-950 " +
        "shadow-[0_30px_70px_-30px_rgba(0,0,0,0.95)]";

    return (
        <div
            ref={ref}
            className="relative w-full select-none font-sans text-sm"
            style={{ height }}
            aria-label="Two custom FireCMS fields: an anatomical body-part picker and a location map, both supplied by the developer"
        >
            {/* Card 1 — body parts */}
            <div className={cardBase + " absolute left-0 top-0 z-10 w-[660px]"} style={{ height: "calc(100% - 44px)" }}>
                <div className="flex shrink-0 items-center gap-2 border-b border-surface-800 py-3 pl-4 pr-12">
                    {/* LabelWithIcon — align-middle inline-flex items-center my-0.5 gap-2 */}
                    <div className="align-middle inline-flex items-center my-0.5 gap-2">
                        <PropertyConfigBadge config={"multi_select"} className={"h-6 w-6"}/>
                        <span className="text-start font-medium text-sm text-text-primary dark:text-text-primary-dark">
                            Body parts
                        </span>
                    </div>
                    <Chip size={"smallest"}>custom</Chip>
                    <Typography variant={"caption"} color={"disabled"}>MedicalMotion</Typography>
                </div>

                <div className="flex min-h-0 flex-1 gap-3 py-4 pl-4 pr-12">
                    <div className="flex shrink-0 items-stretch gap-2 rounded-xl border border-surface-800 bg-surface-900/60 p-2">
                        <div className="flex flex-col items-center">
                            <BodyView view="front" src="/img/body_front_c.webp" selected={selected}/>
                            <span className="mt-1 text-[10px] uppercase tracking-wider text-surface-600">Front</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <BodyView view="back" src="/img/body_back_c.webp" selected={selected}/>
                            <span className="mt-1 text-[10px] uppercase tracking-wider text-surface-600">Back</span>
                        </div>
                    </div>

                    <div className="grid min-h-0 min-w-0 flex-1 grid-cols-2 content-start gap-1">
                        {ENUM_ENTRIES.map(entry => {
                            const isActive = selected.includes(entry.id);
                            return (
                                <span
                                    key={entry.id}
                                    className={
                                        "flex items-center gap-1.5 rounded-lg px-1.5 py-[3px] text-[10px] outline outline-1 transition-all duration-200 " +
                                        (isActive
                                            ? "bg-primary/10 font-semibold text-primary outline-primary/50"
                                            : "text-surface-500 outline-transparent")
                                    }
                                >
                                    <span className={"h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-200 " + (isActive ? "bg-primary" : "bg-surface-700")}/>
                                    <span className="truncate">{entry.label}</span>
                                </span>
                            );
                        })}
                    </div>
                </div>

                <code className="shrink-0 overflow-x-auto whitespace-pre border-t border-surface-800 py-3 pl-4 pr-12 font-mono text-[11px]">
                    <span className="text-sky-300">bodyParts</span>
                    <span className="text-surface-400">: [</span>
                    <span className="text-emerald-300">{selected.map(p => `"${p}"`).join(", ")}</span>
                    <span className="text-surface-400">]</span>
                </code>
            </div>

            {/* Card 2 — location. Overlaps card 1, and runs into the bleed. */}
            <div
                className={cardBase + " absolute top-[44px] z-20 w-[620px] ring-1 ring-white/[0.06]"}
                style={{ left: "620px", height: "calc(100% - 44px)" }}
            >
                <div className="flex shrink-0 items-center gap-2 border-b border-surface-800 px-4 py-3">
                    <div className="align-middle inline-flex items-center my-0.5 gap-2">
                        <PropertyConfigBadge config={"geopoint"} className={"h-6 w-6"}/>
                        <span className="text-start font-medium text-sm text-text-primary dark:text-text-primary-dark">
                            Location
                        </span>
                    </div>
                    <Chip size={"smallest"}>custom</Chip>
                </div>

                <div className="relative min-h-0 flex-1 overflow-hidden">
                    <BarcelonaMap/>

                    {/* Pin, projected from the store's coordinates */}
                    <div
                        className="absolute -translate-x-1/2 -translate-y-full transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{ left: `${(pin.x / MAP_W) * 100}%`, top: `${(pin.y / MAP_H) * 100}%` }}
                    >
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                                d="M12 22s7.5-6.2 7.5-12A7.5 7.5 0 1 0 4.5 10c0 5.8 7.5 12 7.5 12z"
                                fill="#0070f4"
                                stroke="#cfe4ff"
                                strokeWidth="1.2"
                            />
                            <circle cx="12" cy="10" r="2.9" fill="#0b1016"/>
                        </svg>
                    </div>

                    {/* Readout, kept left so the bleed never eats it */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg bg-black/75 px-3 py-2 backdrop-blur-sm">
                        <span className="text-xs text-surface-100">{current.place}</span>
                        <span className="font-mono text-[11px] tabular-nums text-surface-400">
                            {current.lat.toFixed(4)}, {current.lon.toFixed(4)}
                        </span>
                    </div>
                </div>

                <code className="shrink-0 overflow-x-auto whitespace-pre border-t border-surface-800 px-4 py-3 font-mono text-[11px]">
                    <span className="text-sky-300">location</span>
                    <span className="text-surface-400">: {"{ "}</span>
                    <span className="text-sky-300">lat</span>
                    <span className="text-surface-400">: </span>
                    <span className="text-orange-300">{current.lat.toFixed(4)}</span>
                    <span className="text-surface-400">, </span>
                    <span className="text-sky-300">lng</span>
                    <span className="text-surface-400">: </span>
                    <span className="text-orange-300">{current.lon.toFixed(4)}</span>
                    <span className="text-surface-400">{" }"}</span>
                </code>
            </div>
        </div>
    );
}
