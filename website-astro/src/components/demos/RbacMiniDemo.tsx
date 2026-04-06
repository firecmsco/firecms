import React, { useState, useEffect } from "react";

export function RbacMiniDemo() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const loop = async () => {
            while (isMounted) {
                setStep(0);
                await new Promise(r => setTimeout(r, 1000));
                if (!isMounted) return;
                setStep(1); // Click rule
                await new Promise(r => setTimeout(r, 400));
                if (!isMounted) return;
                setStep(2); // dropdown open
                await new Promise(r => setTimeout(r, 600));
                if (!isMounted) return;
                setStep(3); // switch to ALL
                await new Promise(r => setTimeout(r, 2000));
            }
        };
        loop();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="h-32 w-full bg-surface-950 rounded-lg border border-surface-800 mb-6 flex flex-col pointer-events-none select-none p-3 overflow-hidden relative">
            <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <span className="text-[11px] font-bold text-white">Row Level Security</span>
            </div>

            <div className="bg-surface-900/50 rounded border border-surface-800/50 flex flex-col divide-y divide-surface-800/50">
                {/* Admin row */}
                <div className="flex justify-between items-center p-2">
                    <span className="text-[9px] text-surface-300 font-mono">role === 'admin'</span>
                    <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded">ALL</span>
                </div>
                {/* User row */}
                <div className="flex justify-between items-center p-2">
                    <span className="text-[9px] text-surface-300 font-mono">role === 'editor'</span>
                    <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">SELECT, UPDATE</span>
                </div>
                {/* Public row */}
                <div className="flex justify-between items-center p-2 relative">
                    <span className="text-[9px] text-surface-300 font-mono">public</span>
                    
                    <div className={`relative flex items-center transition-all ${step === 1 ? 'ring-1 ring-primary/50 rounded' : ''}`}>
                        {step <= 2 && <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">DENIED <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg></span>}
                        {step >= 3 && <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">SELECT <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg></span>}
                        
                        {step === 2 && (
                            <div className="absolute top-5 right-0 bg-surface-800 border border-surface-700 shadow-xl rounded-sm w-16 z-10 py-1">
                                <div className="text-[8px] text-surface-400 px-2 py-0.5">DENIED</div>
                                <div className="text-[8px] text-white px-2 py-0.5 bg-primary/20">SELECT</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
