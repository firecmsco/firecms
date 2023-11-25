import React, { useEffect, useRef } from "react";
import { NeatGradient } from "@firecms/neat";

function getBrightnessFrom(scroll: number) {
    const min = .5;
    const max = .8;
    return Math.min(max, Math.max(min, min + scroll / 1000));
}

function getSaturateFrom(scroll: number) {
    const min = -10;
    const max = -8;
    return Math.min(max, Math.max(min, min + scroll / 50));
}
function getAmplitude(scroll: number) {
    const min = 5;
    const max = 30;
    return Math.min(max, Math.max(min, min + scroll / 50));
}

export default function NewNeatGradient({}: {}) {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const gradientRef = useRef<NeatGradient | null>(null);
    const scrollRef = useRef<number>(0);

    function onScrollUpdate(scroll: number) {
        scrollRef.current = scroll;
        if (gradientRef.current) {
            gradientRef.current.colorBrightness = getBrightnessFrom(scroll);
            gradientRef.current.colorSaturation = getSaturateFrom(scroll);
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
            // "colors": [
            //     {
            //         "color": "#eeeeee",
            //         "enabled": true
            //     },
            //
            //     {
            //         "color": "#e8eaf3",
            //         "enabled": true
            //     },
            //     {
            //         "color": "#f8eeec",
            //         "enabled": true
            //     },
            // {
            //     "color": "#fb5607",
            //     "enabled": true
            // },
            // {
            //     "color": "#ff006e",
            //     "enabled": true
            // },
            // {
            //     "color": "#8338ec",
            //     "enabled": true
            // }
            // ],
            // "speed": 3,
            // "horizontalPressure": 3,
            // "verticalPressure": 3,
            // "waveFrequencyX": 2,
            // "waveFrequencyY": 3,
            // "waveAmplitude": 3,
            // "shadows": 0,
            // "highlights": 0,
            // "saturation": -4,
            // "wireframe": true,
            // "colorBlending": 5,
            // // "backgroundColor": "#0E151E",
            // "backgroundAlpha": 0
            "colors": [
                // {
                //     "color": "#222228",
                //     "enabled": true
                // },
                {
                    "color": "#fb5607",
                    "enabled": true
                },
                {
                    "color": "#0070F4",
                    "enabled": true
                },
                {
                    "color": "#8338ec",
                    "enabled": true
                }
            ],
            "speed": 2,
            "horizontalPressure": 5,
            "verticalPressure": 10,
            "waveFrequencyX": 2,
            "waveFrequencyY": 3,
            "waveAmplitude": getAmplitude(scrollRef.current),
            "shadows": 0,
            "highlights": 0,
            "colorSaturation": getSaturateFrom(scrollRef.current),
            "colorBrightness": getBrightnessFrom(scrollRef.current),
            "wireframe": true,
            "colorBlending": 6,
            "backgroundColor": "#35353a",
            // "backgroundColor": "#201f22",
            "backgroundAlpha": 1,
            resolution: 1 / 3.33335
        });

        return gradientRef.current.destroy;

    }, [canvasRef.current])

    return (
        <canvas
            className={"bg-gray-800"}
            style={{
                position: "absolute",
                isolation: "isolate",
                height: "100%",
                // maxHeight: "505px",
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

function getRandomInt(from: number, to: number) {
    return Math.floor(Math.random() * (to - from) + from);
}
