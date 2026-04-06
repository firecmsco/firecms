import React, { useState, useEffect } from "react";

export function ReactExtMiniDemo() {
    const [isCompiled, setIsCompiled] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const loop = async () => {
            while (isMounted) {
                setIsCompiled(false);
                await new Promise(r => setTimeout(r, 1500));
                if (!isMounted) return;
                setIsCompiled(true);
                await new Promise(r => setTimeout(r, 2500));
            }
        };
        loop();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="h-32 w-full bg-surface-950 rounded-lg border border-surface-800 mb-6 overflow-hidden flex pointer-events-none select-none">
            {/* Editor Side */}
            <div className="w-1/2 border-r border-surface-800/60 bg-[#161618] p-3 font-mono text-[9px] flex flex-col gap-1.5 justify-center relative">
                <div className="text-pink-400 flex"><span className="text-surface-500 mr-1">1</span><span>export</span> <span className="text-blue-400 ml-1">function</span> <span className="text-yellow-200 ml-1">Custom()</span> {'{'}</div>
                <div className="text-surface-300 flex"><span className="text-surface-500 mr-1">2</span>&nbsp;&nbsp;<span className="text-pink-400">return</span> (</div>
                <div className="text-surface-300 flex"><span className="text-surface-500 mr-1">3</span>&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-green-400">Button</span> <span className="text-blue-300">variant</span>=<span className="text-orange-300">"new"</span>&gt;</div>
                <div className="text-surface-300 flex"><span className="text-surface-500 mr-1">4</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Hello Rebase</div>
                <div className="text-surface-300 flex"><span className="text-surface-500 mr-1">5</span>&nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span className="text-green-400">Button</span>&gt;</div>
                <div className="text-surface-300 flex"><span className="text-surface-500 mr-1">6</span>&nbsp;&nbsp;);</div>
                <div className="text-surface-300 flex"><span className="text-surface-500 mr-1">7</span>{'}'}</div>

                {/* Compilation sweeping laser effect */}
                {isCompiled && (
                    <div className="absolute inset-0 bg-blue-500/10 pointer-events-none animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_1]"></div>
                )}
            </div>
            {/* Preview Side */}
            <div className="w-1/2 bg-surface-900/30 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50"></div>
                
                <div className="relative">
                    {!isCompiled ? (
                        <div className="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700/50 flex items-center justify-center opacity-50 shadow-sm transition-all duration-300">
                             <svg className="w-4 h-4 text-surface-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37..."></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"/></svg>
                        </div>
                    ) : (
                        <div className="px-3 py-1.5 rounded-md bg-blue-600 text-white font-semibold text-[10px] shadow-[0_0_15px_rgba(37,99,235,0.4)] ring-1 ring-white/20 transform scale-100 transition-all duration-500 ease-out flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            Hello Rebase
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
