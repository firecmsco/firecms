import React, { useEffect, useRef } from "react";
import { NeatGradient } from "@firecms/neat";
import { easeInOut } from "../partials/styles";

function getBrightnessFrom(scroll: number) {
    const min = .3;
    const max = .7;
    return Math.min(max, Math.max(min, min + scroll / 1000));
}

function getAlphaFrom(scroll: number) {
    const min = 0;
    const max = 1;
    return easeInOut(Math.min(max, Math.max(min, min + (scroll) / 1000)));
}

function getSaturateFrom(scroll: number) {
    const min = -10;
    const max = -6;
    return Math.min(max, Math.max(min, min + scroll / 50));
}

function getAmplitude(scroll: number) {
    const min = 10;
    const max = 30;
    return Math.min(max, Math.max(min, min + scroll / 50));
}

function getResolution(width: number) {
    return Math.log(width) / 22;
    // return 1 / 2;
    // const min = 1 / 3.33335;
    // const max = 1 / 2;
    // return Math.min(max, Math.max(min, min + scroll / 1000));
}

export default function HomeHeroNeatGradient() {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const gradientRef = useRef<NeatGradient | null>(null);
    const scrollRef = useRef<number>(0);

    function onScrollUpdate(scroll: number, width: number = 0) {
        scrollRef.current = scroll;
        if (gradientRef.current) {
            gradientRef.current.colorBrightness = getBrightnessFrom(scroll);
            gradientRef.current.colorSaturation = getSaturateFrom(scroll);
            gradientRef.current.waveAmplitude = getAmplitude(scroll);

            gradientRef.current.backgroundAlpha = getAlphaFrom(scroll);
            gradientRef.current.resolution = getResolution(width);
        }
    }

    useEffect(() => {
        const listener = () => {
            if (typeof window !== "undefined") {
                onScrollUpdate(window?.scrollY ?? 0, window?.innerWidth ?? 0);
            }
        };
        listener();
        if (typeof window !== "undefined")
            window.addEventListener("resize", listener);
        return () => {
            if (typeof window !== "undefined")
                window.removeEventListener("resize", listener);
        };
    }, [window]);

    useEffect(() => {
        const listener = () => {
            if (typeof window !== "undefined") {
                onScrollUpdate(window?.scrollY ?? 0, window?.innerWidth ?? 0);

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
            return () => {
            };

        const backgroundColor = "rgb(16,24,39)";

        const width = window?.innerWidth ?? 1400;

        const alphaFrom = getAlphaFrom(scrollRef.current);
        gradientRef.current = new NeatGradient({
            ref: canvasRef.current,
            "colors": [
                {
                    "color": "#0070F4",
                    "enabled": true
                },
                {
                    "color": "#fb5607",
                    "enabled": true
                },
                {
                    "color": "#8338ec",
                    "enabled": true
                }
            ],
            "speed": 1.2,
            "horizontalPressure": 5,
            "verticalPressure": 10,
            "waveFrequencyX": 2,
            "waveFrequencyY": 1,
            "waveAmplitude": getAmplitude(scrollRef.current),
            "shadows": 0,
            "highlights": 0,
            "colorSaturation": getSaturateFrom(scrollRef.current),
            "colorBrightness": getBrightnessFrom(scrollRef.current),
            "wireframe": true,
            "colorBlending": 6,
            "backgroundColor": backgroundColor,
            // "backgroundColor": "#201f22",
            "backgroundAlpha": alphaFrom,
            resolution: getResolution(width)
        });

        return gradientRef.current.destroy;

    }, [canvasRef.current])

    return (
        <canvas
            // className={"bg-gray-100"}
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
