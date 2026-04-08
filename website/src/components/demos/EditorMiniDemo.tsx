import React, { useState, useEffect } from "react";

export function EditorMiniDemo() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const loop = async () => {
            while (isMounted) {
                setStep(0);
                await new Promise(r => setTimeout(r, 800));
                if (!isMounted) return;
                setStep(1); // Types "/im"
                await new Promise(r => setTimeout(r, 400));
                if (!isMounted) return;
                setStep(2); // Types "/image" and dropdown appears
                await new Promise(r => setTimeout(r, 800));
                if (!isMounted) return;
                setStep(3); // Image block inserted
                await new Promise(r => setTimeout(r, 1500));
                if (!isMounted) return;
                setStep(4); // Types below
                await new Promise(r => setTimeout(r, 2000));
            }
        };
        loop();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="h-32 w-full bg-surface-950 rounded-lg border border-surface-800 mb-6 overflow-hidden flex flex-col pointer-events-none select-none relative">
            {/* Fake editor toolbar */}
            <div className="h-6 border-b border-surface-800/60 bg-surface-900/50 flex items-center px-2 gap-1 shrink-0">
                <div className="h-2 w-2 rounded-full bg-surface-700"></div>
                <div className="h-2 w-2 rounded-full bg-surface-700"></div>
                <div className="h-2 w-2 rounded-full bg-surface-700"></div>
                <div className="ml-2 h-2 w-4 rounded bg-surface-700"></div>
                <div className="h-2 w-6 rounded bg-surface-700"></div>
            </div>
            {/* Editor content */}
            <div className="p-3 flex-1 flex flex-col gap-2 relative">
                <div className="w-2/3 h-2 bg-surface-700/50 rounded"></div>
                
                {step === 0 && <div className="flex items-center"><div className="w-[1px] h-3 bg-primary animate-pulse"></div></div>}
                
                {step === 1 && <div className="text-[10px] font-mono text-surface-400 flex items-center">/im<div className="w-[1px] h-3 bg-primary animate-pulse ml-[1px]"></div></div>}
                
                {step === 2 && (
                    <div className="relative">
                        <div className="text-[10px] font-mono text-surface-400 flex items-center">/image<div className="w-[1px] h-3 bg-primary animate-pulse ml-[1px]"></div></div>
                        <div className="absolute top-4 left-0 bg-surface-800 border border-surface-700 rounded shadow-lg p-1 w-24">
                            <div className="bg-surface-700/50 rounded flex items-center p-1 gap-1">
                                <svg className="w-3 h-3 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                <span className="text-[8px] text-surface-300">Image</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {(step === 3 || step === 4) && (
                    <div className="w-full h-12 bg-surface-800/40 rounded border border-surface-700/50 border-dashed flex items-center justify-center relative overflow-hidden">
                        <svg className="w-4 h-4 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                )}
                
                {step === 4 && <div className="text-[9px] text-surface-400 mt-1 flex items-center">Visual editor integration.<div className="w-[1px] h-3 bg-primary animate-pulse ml-[1px]"></div></div>}
            </div>
        </div>
    );
}
