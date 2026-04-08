import React, { useState, useEffect } from "react";

export function RealtimeMiniDemo() {
    const [syncState, setSyncState] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const loop = async () => {
            while (isMounted) {
                setSyncState(0);
                await new Promise(r => setTimeout(r, 600));
                if (!isMounted) return;
                setSyncState(1); // User 1 types 'H'
                await new Promise(r => setTimeout(r, 200));
                if (!isMounted) return;
                setSyncState(2); // Types 'i'
                await new Promise(r => setTimeout(r, 500));
                if (!isMounted) return;
                setSyncState(3); // Syncs to User 2
                await new Promise(r => setTimeout(r, 1500));
                if (!isMounted) return;
                setSyncState(4); // User 2 types '!'
                await new Promise(r => setTimeout(r, 300));
                if (!isMounted) return;
                setSyncState(5); // Syncs to User 1
                await new Promise(r => setTimeout(r, 1500));
            }
        };
        loop();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="h-full w-full bg-surface-950 flex gap-2 p-2 pointer-events-none select-none relative">
            {/* Syncing line graphic in background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <svg className="w-full h-full text-primary/20" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M25,50 Q50,50 75,50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2">
                        {syncState === 3 && <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.5s" fill="freeze" />}
                        {syncState === 5 && <animate attributeName="stroke-dashoffset" from="-10" to="0" dur="0.5s" fill="freeze" />}
                    </path>
                </svg>
            </div>

            {/* Window 1 (User A) */}
            <div className="flex-1 rounded border border-surface-800 bg-[#161618] flex flex-col overflow-hidden z-10 shadow-lg">
                <div className="h-4 bg-surface-800/80 border-b border-surface-700/50 flex items-center px-1 gap-0.5 shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                    <span className="text-[7px] text-surface-400 ml-1 font-mono tracking-wider">alice</span>
                </div>
                <div className="p-2 flex-1 flex flex-col gap-1 items-center justify-center text-[10px] text-white">
                    <div className={`p-1.5 rounded bg-surface-800 w-full flex items-center transition-all ${syncState === 5 ? "ring-1 ring-primary/50 shadow-[0_0_10px_rgba(var(--color-primary),0.2)]" : ""}`}>
                        <div className="w-3 h-3 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-[8px] mr-1.5 shrink-0">Aa</div>
                        <span className="font-mono text-[9px]">
                            {syncState === 0 && <span className="opacity-0">.</span>}
                            {syncState === 1 && "H"}
                            {(syncState >= 2 && syncState < 4) && "Hi"}
                            {syncState >= 4 && "Hi!"}
                            {(syncState >= 1 && syncState <= 2) && <div className="inline-block w-[1px] h-2 bg-primary animate-pulse ml-[1px]"></div>}
                        </span>
                    </div>
                </div>
            </div>

            {/* Window 2 (User B) */}
            <div className="flex-1 rounded border border-surface-800 bg-[#161618] flex flex-col overflow-hidden z-10 shadow-lg">
                <div className="h-4 bg-surface-800/80 border-b border-surface-700/50 flex items-center px-1 gap-0.5 shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-surface-600"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-surface-600"></div>
                    <div className="h-1.5 w-1.5 rounded-full bg-surface-600"></div>
                    <span className="text-[7px] text-surface-400 ml-1 font-mono tracking-wider">bob</span>
                </div>
                <div className="p-2 flex-1 flex flex-col gap-1 items-center justify-center text-[10px] text-white">
                    <div className={`p-1.5 rounded bg-surface-800 w-full flex items-center transition-all ${syncState === 3 ? "ring-1 ring-primary/50 shadow-[0_0_10px_rgba(var(--color-primary),0.2)]" : ""}`}>
                        <div className="w-3 h-3 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-[8px] mr-1.5 shrink-0">Aa</div>
                        <span className="font-mono text-[9px]">
                            {syncState < 3 && <span className="opacity-0">.</span>}
                            {syncState === 3 && "Hi"}
                            {syncState >= 4 && "Hi!"}
                            {syncState === 4 && <div className="inline-block w-[1px] h-2 bg-primary animate-pulse ml-[1px]"></div>}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
