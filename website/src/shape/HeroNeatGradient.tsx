import React, { useEffect, useRef } from "react";
import { NeatGradient } from "@firecms/neat";

function getAmplitude(scroll: number) {
    const min = 10;
    const max = 40;
    return Math.min(max, Math.max(min, min + scroll / 50));
}

export default function HeroNeatGradient({ color }: { color: "primary" | "secondary" }) {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const gradientRef = useRef<NeatGradient | null>(null);
    const scrollRef = useRef<number>(0);

    function onScrollUpdate(scroll: number) {
        scrollRef.current = scroll;
        if (gradientRef.current) {
            gradientRef.current.waveAmplitude = getAmplitude(scroll);
        }
    }

    useEffect(() => {
        const listener = () => {
            if (typeof window !== "undefined") {
                onScrollUpdate(window?.scrollY ?? 0)

            }
        };
        listener();
        if (typeof window !== "undefined")
            window.addEventListener("scroll", listener);
        return () => {
            if (typeof window !== "undefined")
                window.removeEventListener("scroll", listener);
        };
    }, [window]);

    useEffect(() => {

        if (!canvasRef.current)
            return;

        gradientRef.current = new NeatGradient({
            ref: canvasRef.current,
            "colors": [
                {
                    "color": "#FF5373",
                    "enabled": true
                },
                {
                    "color": "#FFC858",
                    "enabled": true
                },
                {
                    "color": "#05d5ef",
                    "enabled": true
                },
                {
                    "color": "#6D3BFF",
                    "enabled": true
                },
                {
                    "color": "#f5e1e5",
                    "enabled": false
                }
            ],
            "speed": 4,
            "horizontalPressure": 4,
            "verticalPressure": 5,
            "waveFrequencyX": 2,
            "waveFrequencyY": 3,
            "waveAmplitude": getAmplitude(scrollRef.current),
            "shadows": 0,
            "highlights": 1,
            "colorSaturation": 0,
            "wireframe": true,
            "colorBlending": 6,
            // "backgroundColor": "#0070F4",
            "backgroundAlpha": 0,
            resolution: 1 / 3.33335
        });

        return gradientRef.current.destroy;

    }, [canvasRef.current])

    return (
        <canvas
            className={color === "primary" ? "bg-blue-600" : "bg-rose-500"}
            style={{
                position: "absolute",
                isolation: "isolate",
                height: "100%",
                width: "100%",
                top: `0px`,
                margin: "auto",
                left: `0px`,
                right: 0,
            }}
            ref={canvasRef}
        />
    );

}
