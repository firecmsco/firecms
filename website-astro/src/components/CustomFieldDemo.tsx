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
 * The location field is a real basemap of central Madrid — a static raster
 * built once by `scripts/build_map_image.py` and self-hosted, so the page pays
 * no tile requests — with the pin projected onto it in Web Mercator from each
 * store's actual latitude and longitude. There is deliberately no map in the
 * built-in geopoint field (it renders two number inputs, because a live tile
 * provider means an API key and a network dependency), which is exactly why a
 * map is the thing you bring your own component for.
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

/**
 * The window the map raster covers, as printed by `scripts/build_map_image.py`.
 * The image is cropped to this box *and* to the map area's aspect ratio, so
 * object-cover lays it over the box 1:1 and these bounds address it directly —
 * keep the two in step if you ever re-frame the map.
 */
const MAP_BOUNDS = { west: -3.72784, east: -3.648458, north: 40.436788, south: 40.402727 };

const mercatorY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const NORTH_Y = mercatorY(MAP_BOUNDS.north);
const SOUTH_Y = mercatorY(MAP_BOUNDS.south);

/** Web Mercator, as a fraction of the map box — the same maths the tiles use. */
const project = (lat: number, lon: number) => ({
    x: (lon - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west),
    y: (NORTH_Y - mercatorY(lat)) / (NORTH_Y - SOUTH_Y)
});

/** Real Madrid neighbourhoods; the pin is projected from these. */
const STEPS = [
    { parts: ["chest", "triceps", "abs"], place: "Malasaña", lat: 40.4262, lon: -3.7038 },
    { parts: ["quads", "glutes", "calves"], place: "Salamanca", lat: 40.4283, lon: -3.6795 },
    { parts: ["shoulders", "biceps", "forearms"], place: "La Latina", lat: 40.4109, lon: -3.7095 },
    { parts: ["upper_back", "lower_back"], place: "Chamberí", lat: 40.4327, lon: -3.6997 }
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
            <div className={cardBase + " absolute left-0 top-0 z-10 w-[660px]"} style={{ height: "calc(100% - 68px)" }}>
                <div className="flex shrink-0 items-center gap-2 border-b border-surface-800 py-3 pl-4 pr-24">
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

                <div className="flex min-h-0 flex-1 gap-3 py-4 pl-4 pr-24">
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

                <code className="shrink-0 overflow-x-auto whitespace-pre border-t border-surface-800 py-3 pl-4 pr-24 font-mono text-[11px]">
                    <span className="text-sky-300">bodyParts</span>
                    <span className="text-surface-400">: [</span>
                    <span className="text-emerald-300">{selected.map(p => `"${p}"`).join(", ")}</span>
                    <span className="text-surface-400">]</span>
                </code>
            </div>

            {/* Card 2 — location. Overlaps card 1, and runs into the bleed. */}
            <div
                className={cardBase + " absolute top-[68px] z-20 w-[620px] ring-1 ring-white/[0.06]"}
                style={{ left: "570px", height: "calc(100% - 68px)" }}
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
                    <img
                        src="/img/madrid_map.webp"
                        width={1240}
                        height={699}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full select-none object-cover"
                    />

                    {/* Pin, projected from the store's coordinates */}
                    <div
                        className="absolute -translate-x-1/2 -translate-y-full transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
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

                    {/* Readout and map credit, kept left so the bleed never eats them */}
                    <div className="absolute bottom-3 left-3 flex flex-col items-start gap-1.5">
                        <span className="text-[9px] leading-none text-surface-500">
                            © OpenStreetMap contributors · Esri
                        </span>
                        <div className="flex items-center gap-3 rounded-lg bg-black/75 px-3 py-2 backdrop-blur-sm">
                            <span className="text-xs text-surface-100">{current.place}</span>
                            <span className="font-mono text-[11px] tabular-nums text-surface-400">
                                {current.lat.toFixed(4)}, {current.lon.toFixed(4)}
                            </span>
                        </div>
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
