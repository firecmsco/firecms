import React, { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

/**
 * What you switch on in a Firebase project before FireCMS is useful.
 *
 * Replaces two Firebase-console screenshots that had gone stale (old console
 * navigation, Twitter branding, Firebase JS SDK v7) and carried the demo
 * project's real config object. Rendered rather than captured, so it does not
 * rot when Google restyles the console, and the credentials are placeholders.
 *
 * Sized for the Starlight docs column. Autoplay only — no pointer events.
 */

const STEPS = ["Firestore", "Web app", "Authentication", "Storage"] as const;

function Switch({ on }: { on: boolean }) {
    return (
        <span className={
            "w-[34px] h-[20px] min-w-[34px] min-h-[20px] rounded-full relative inline-block ring-1 transition-colors duration-200 " +
            (on ? "ring-[#0070F4] bg-[#0070F4]" : "bg-[#2a2d35] ring-[#3a3e48]")
        }>
            <span className={
                "block rounded-full transition-transform duration-200 ease-out w-[17px] h-[17px] mt-[1.5px] " +
                (on ? "bg-white translate-x-[15px]" : "bg-[#6b7280] translate-x-[2px]")
            }/>
        </span>
    );
}

const PROVIDERS: [string, boolean][] = [
    ["Email / Password", true],
    ["Google", true],
    ["Anonymous", false],
    ["Phone", false]
];

/** Placeholders — never the real project's values. */
const CONFIG: [string, string][] = [
    ["apiKey", "AIza…"],
    ["authDomain", "your-project.firebaseapp.com"],
    ["projectId", "your-project"],
    ["storageBucket", "your-project.appspot.com"],
    ["messagingSenderId", "000000000000"],
    ["appId", "1:000000000000:web:…"]
];

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex items-baseline gap-2 leading-[1.75]">
            <span className="text-[#7dd3fc]">{label}</span>
            <span className="text-[#4b5563]">:</span>
            <span className={(mono ? "font-mono " : "") + "text-[#a5b4fc]"}>{value}</span>
        </div>
    );
}

export default function FirebaseSetupChecklist() {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [i, setI] = useState(0);
    const t = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (t.current) clearTimeout(t.current);
        if (!inView) return;
        t.current = setTimeout(() => setI(v => (v + 1) % STEPS.length), 3800);
        return () => { if (t.current) clearTimeout(t.current); };
    }, [i, inView]);

    return (
        <div ref={ref}
             className="not-content my-7 w-full select-none overflow-hidden rounded-xl border border-[#242832] bg-[#0d1016]"
             aria-label="The four Firebase services FireCMS needs: Firestore, a web app config, Authentication and Storage">

            {/* Steps */}
            <div className="flex flex-wrap gap-1 border-b border-[#1e222c] bg-[#11141b] p-2">
                {STEPS.map((s, idx) => (
                    <span key={s}
                          className={
                              "rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors duration-200 " +
                              (idx === i ? "bg-[#0070F4] text-white" : "text-[#6b7280]")
                          }>
                        <span className="mr-1.5 opacity-60">{idx + 1}</span>{s}
                    </span>
                ))}
            </div>

            <div className="min-h-[212px] p-4 text-[12.5px]">
                {i === 0 && (
                    <div key="fs" className="fade">
                        <p className="mb-3 text-[#9ca3af]">
                            Enable Firestore. A default project denies every read and write until you
                            change the rules — FireCMS will connect and show nothing.
                        </p>
                        <pre className="overflow-x-auto rounded-lg border border-[#1e222c] bg-black/50 p-3 font-mono text-[11.5px] leading-[1.7]">
<span className="text-[#4b5563]">// everything private by default</span>{"\n"}
<span className="text-[#c084fc]">match</span> <span className="text-[#a5b4fc]">/{"{document=**}"}</span> {"{"}{"\n"}
{"  "}<span className="text-[#c084fc]">allow</span> read, write: <span className="text-[#c084fc]">if</span> <span className="text-[#f87171]">false</span>;{"\n"}
{"}"}{"\n"}
<span className="text-[#4b5563]">// then open up what an editor needs</span>{"\n"}
<span className="text-[#c084fc]">match</span> <span className="text-[#a5b4fc]">/products/{"{id=**}"}</span> {"{"}{"\n"}
{"  "}<span className="text-[#c084fc]">allow</span> read: <span className="text-[#34d399]">true</span>;{"\n"}
{"  "}<span className="text-[#c084fc]">allow</span> write: <span className="text-[#c084fc]">if</span> request.auth != <span className="text-[#f87171]">null</span>;{"\n"}
{"}"}
                        </pre>
                    </div>
                )}

                {i === 1 && (
                    <div key="app" className="fade">
                        <p className="mb-3 text-[#9ca3af]">
                            <span className="text-[#e5e7eb]">Project settings → Your apps → Web app.</span>{" "}
                            Firebase hands you this object; it is what you pass to FireCMS.
                        </p>
                        <div className="overflow-x-auto rounded-lg border border-[#1e222c] bg-black/50 p-3 font-mono text-[11.5px]">
                            <div className="text-[#4b5563]">const firebaseConfig = {"{"}</div>
                            <div className="pl-4">
                                {CONFIG.map(([k, v]) => <Row key={k} label={k} value={`"${v}"`} mono/>)}
                            </div>
                            <div className="text-[#4b5563]">{"}"};</div>
                        </div>
                    </div>
                )}

                {i === 2 && (
                    <div key="auth" className="fade">
                        <p className="mb-3 text-[#9ca3af]">
                            Turn on the sign-in providers your team will use. FireCMS builds roles and
                            per-collection permissions on top of Firebase Auth.
                        </p>
                        <div className="overflow-hidden rounded-lg border border-[#1e222c] bg-black/40">
                            {PROVIDERS.map(([name, on], idx) => (
                                <div key={name}
                                     className={"flex items-center justify-between px-3 py-2 " + (idx ? "border-t border-[#1a1d25]" : "")}>
                                    <span className={on ? "text-[#e5e7eb]" : "text-[#6b7280]"}>{name}</span>
                                    <span className="flex items-center gap-2.5">
                                        <span className={"text-[11px] " + (on ? "text-[#34d399]" : "text-[#4b5563]")}>
                                            {on ? "Enabled" : "Disabled"}
                                        </span>
                                        <Switch on={on}/>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {i === 3 && (
                    <div key="st" className="fade">
                        <p className="mb-3 text-[#9ca3af]">
                            Enable Storage if you want file, image or video fields. Uploads go to the
                            project's default bucket.
                        </p>
                        <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-[#1e222c] bg-black/40 px-3 py-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0070F4]/15 text-[#60a5fa]">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>
                                </svg>
                            </span>
                            <span className="font-mono text-[11.5px] text-[#a5b4fc]">
                                gs://your-project.appspot.com
                            </span>
                        </div>
                        <p className="text-[#6b7280]">
                            If downloads fail with a CORS error, apply a <span className="font-mono text-[#9ca3af]">cors.json</span>{" "}
                            with <span className="font-mono text-[#9ca3af]">gsutil cors set</span> — see below.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @media (prefers-reduced-motion: no-preference) {
                    .fade { animation: fsc-fade 300ms ease-out backwards; }
                }
                @keyframes fsc-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
            `}</style>
        </div>
    );
}
