import React, { useEffect, useRef } from "react";
import { NeatGradient } from "@firecms/neat";

function getBrightnessFrom(scroll: number, isDark: boolean) {
    if (!isDark) return 1;
    const min = .1;
    const max = 2;
    return Math.min(max, Math.max(min, min + scroll / 1000));
}

function getAmplitude(scroll: number, isDark: boolean) {
    if (!isDark) return 10;
    const min = 5;
    const max = 10;
    return Math.min(max, Math.max(min, min + scroll / 50));
}

function getSaturation(scroll: number, isDark: boolean) {
    if (!isDark) return 1;
    const min = -8;
    const max = 5;
    return Math.min(max, Math.max(min, min + scroll / 50));
}

export default function HeroNeatGradient({ color }: {
    color: "primary" | "secondary" | "dark" | "transparent",
}) {

    const isDark = color === "dark";
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const gradientRef = useRef<NeatGradient | null>(null);
    const scrollRef = useRef<number>(0);

    function onScrollUpdate(scroll: number) {
        scrollRef.current = scroll;
        if (gradientRef.current) {
            gradientRef.current.colorBrightness = getBrightnessFrom(scroll, isDark);
            gradientRef.current.waveAmplitude = getAmplitude(scroll, isDark);
            gradientRef.current.colorSaturation = getSaturation(scrollRef.current, isDark);
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

        const config = {
            "colors": [
                {
                    "color": "#F53755",
                    "enabled": true
                },
                {
                    "color": "#FFC858",
                    "enabled": true
                },
                {
                    "color": "#17E7FF",
                    "enabled": true
                },
                {
                    "color": "#6D3BFF",
                    "enabled": true
                },
                {
                    "color": "#007CFD",
                    "enabled": true
                }
            ],
            "speed": 2,
            "horizontalPressure": 4,
            "verticalPressure": 8,
            "waveFrequencyX": 2,
            "waveFrequencyY": 3,
            "shadows": 0,
            "highlights": 2,
            "wireframe": true,
            "colorBlending": 10,
            "backgroundAlpha": 0,
            "resolution": .8,
            "waveAmplitude": getAmplitude(scrollRef.current, isDark),
            "colorSaturation": isDark ? getSaturation(scrollRef.current, isDark) : 1,
            "colorBrightness": isDark ? getBrightnessFrom(scrollRef.current, isDark) : 1,

        };

        gradientRef.current = new NeatGradient({
            ref: canvasRef.current,
            ...config
        });

        return gradientRef.current.destroy;

    }, [canvasRef.current]);

    let bgColor: string;
    if (color === "primary") {
        bgColor = "bg-blue-600";
    } else if (color === "secondary") {
        bgColor = "bg-rose-500";
    } else if(color === "dark"){
        bgColor = "bg-gray-900";
    } else {
        bgColor = "bg-transparent";
    }


    return (
        <canvas
            className={bgColor}
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
