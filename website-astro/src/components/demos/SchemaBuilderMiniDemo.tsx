import React, { useState, useEffect } from "react";

export function SchemaBuilderMiniDemo() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const loop = async () => {
            while (isMounted) {
                setStep(0);
                await new Promise(r => setTimeout(r, 800));
                if (!isMounted) return;
                setStep(1); // Click add
                await new Promise(r => setTimeout(r, 600));
                if (!isMounted) return;
                setStep(2); // Show new field typing
                await new Promise(r => setTimeout(r, 600));
                if (!isMounted) return;
                setStep(3); // Commit
                await new Promise(r => setTimeout(r, 2000));
            }
        };
        loop();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="h-32 w-full bg-surface-950 rounded-lg border border-surface-800 mb-6 flex flex-col pointer-events-none select-none p-3 overflow-hidden relative">
            <div className="flex items-center justify-between mb-3 border-b border-surface-800/60 pb-2">
                <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    <span className="text-[11px] font-bold text-white">Posts Scheme</span>
                </div>
                <div className={`transition-all duration-300 w-5 h-5 rounded-full ${step >= 1 ? "bg-primary/20 ring-1 ring-primary/40 text-primary" : "bg-surface-800 text-surface-400"} flex items-center justify-center`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center bg-surface-900/50 p-1.5 rounded border border-surface-800/50">
                    <div className="flex items-center gap-1.5">
                        <span className="text-blue-400 text-[9px] font-mono">id</span>
                    </div>
                    <span className="text-surface-500 text-[8px] bg-surface-800 px-1 rounded">uuid</span>
                </div>
                <div className="flex justify-between items-center bg-surface-900/50 p-1.5 rounded border border-surface-800/50">
                    <div className="flex items-center gap-1.5">
                        <span className="text-blue-400 text-[9px] font-mono">title</span>
                    </div>
                    <span className="text-surface-500 text-[8px] bg-surface-800 px-1 rounded">text</span>
                </div>
                
                {step === 0 && <div className="h-6" />}
                
                {step >= 1 && (
                    <div className="flex justify-between items-center bg-primary/10 p-1.5 rounded border border-primary/30 ring-1 ring-primary/10 transition-all shadow-sm">
                        <div className="flex items-center gap-1.5">
                            {step === 1 && <span className="text-blue-300 text-[9px] font-mono animate-pulse">|</span>}
                            {step >= 2 && <span className="text-blue-400 text-[9px] font-mono">status</span>}
                        </div>
                        <span className="text-primary text-[8px] bg-primary/20 px-1 rounded font-medium">
                            {step === 2 ? "..." : "select"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
