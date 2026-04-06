import React, { useState, useEffect } from "react";

export function ApiMiniDemo() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const loop = async () => {
            while (isMounted) {
                setStep(0);
                await new Promise(r => setTimeout(r, 1000));
                if (!isMounted) return;
                setStep(1); // pulse request
                await new Promise(r => setTimeout(r, 400));
                if (!isMounted) return;
                setStep(2); // show json
                await new Promise(r => setTimeout(r, 2000));
            }
        };
        loop();
        return () => { isMounted = false; };
    }, []);

    return (
        <div className="h-full w-full bg-surface-950 flex pointer-events-none select-none overflow-hidden relative">
            <div className="w-[45%] border-r border-surface-800/60 bg-[#161618] p-3 flex flex-col justify-center">
                <div className="flex items-center gap-1 mb-2">
                    <span className="text-[8px] font-bold text-green-400 bg-green-400/10 px-1 py-0.5 rounded">GET</span>
                    <span className="text-[9px] font-mono text-surface-300">/api/users</span>
                </div>
                <div className={`mt-2 h-[1px] w-full bg-gradient-to-r from-green-500/0 via-green-500 to-green-500/0 transform origin-left transition-transform duration-300 ${step >= 1 ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`} />
            </div>

            <div className="flex-1 bg-[#101012] p-3 font-mono text-[9px] relative overflow-hidden flex flex-col justify-center">
                {step === 0 && <div className="text-surface-600 italic text-[8px]">Waiting for request...</div>}
                {step >= 2 && (
                    <div className="text-surface-300 leading-tight animate-[fade-in_0.2s_ease-out]">
                        <span className="text-surface-500">[</span><br/>
                        &nbsp;&nbsp;<span className="text-surface-500">{'{'}</span><br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">"id"</span>: <span className="text-orange-300">1</span>,<br/>
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">"name"</span>: <span className="text-green-300">"Alice"</span><br/>
                        &nbsp;&nbsp;<span className="text-surface-500">{'}'}</span><br/>
                        <span className="text-surface-500">]</span>
                    </div>
                )}
                {step === 1 && (
                    <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
                )}
            </div>
        </div>
    );
}
