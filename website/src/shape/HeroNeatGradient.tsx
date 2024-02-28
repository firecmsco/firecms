import React, { useEffect, useRef } from "react";
import { NeatGradient } from "@firecms/neat";

function getBrightnessFrom(scroll: number) {
    const min = .4;
    const max = .8;
    return Math.min(max, Math.max(min, min + scroll / 1000));
}

function getAmplitude(scroll: number) {
    const min = 5;
    const max = 40;
    return Math.min(max, Math.max(min, min + scroll / 50));
}

function getSaturation(scroll: number) {
    const min = -10;
    const max = 0;
    return Math.min(max, Math.max(min, min + scroll / 50));
}

export default function HeroNeatGradient({ color }: {
    color: "primary" | "secondary" | "dark"
}) {

    const isDark = color === "dark";
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const gradientRef = useRef<NeatGradient | null>(null);
    const scrollRef = useRef<number>(0);

    function onScrollUpdate(scroll: number) {
        scrollRef.current = scroll;
        if (gradientRef.current) {
            gradientRef.current.colorBrightness = isDark ? getBrightnessFrom(scroll) : 1;
            gradientRef.current.waveAmplitude = isDark ? getAmplitude(scroll) : 30;
            gradientRef.current.colorSaturation = isDark ? getSaturation(scrollRef.current) : 0;
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
                    "color": "#6D3BFF",
                    "enabled": true
                },
                {
                    "color": "#05d5ef",
                    "enabled": true
                },
                {
                    "color": "#f5e1e5",
                    "enabled": false
                }
            ],
            "speed": 5,
            "horizontalPressure": 4,
            "verticalPressure": 5,
            "waveFrequencyX": 2,
            "waveFrequencyY": 3,
            "waveAmplitude": getAmplitude(scrollRef.current),
            "shadows": 0,
            "highlights": 1,
            "colorSaturation": isDark ? getSaturation(scrollRef.current) : 1,
            "colorBrightness": isDark ? getBrightnessFrom(scrollRef.current) : 1,
            "wireframe": true,
            "colorBlending": 6,
            "backgroundAlpha": 0,
            "resolution": 1 / 2
        });

        return gradientRef.current.destroy;

    }, [canvasRef.current]);

    let bgColor: string;
    if (color === "primary") {
        bgColor = "bg-blue-600";
    } else if (color === "secondary") {
        bgColor = "bg-rose-500";
    } else {
        bgColor = "bg-gray-800";
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
