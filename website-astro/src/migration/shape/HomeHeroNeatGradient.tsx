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

    function onScrollUpdate(scroll: number, width = 0) {
        scrollRef.current = scroll;
        if (gradientRef.current) {
            // gradientRef.current.colorBrightness = getBrightnessFrom(scroll);
            // gradientRef.current.colorSaturation = getSaturateFrom(scroll);
            // gradientRef.current.waveAmplitude = getAmplitude(scroll);
            //
            // gradientRef.current.backgroundAlpha = getAlphaFrom(scroll);
            // gradientRef.current.resolution = getResolution(width);
            gradientRef.current.yOffset = scroll * .6;
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

        // {
        //     colors: [
        //         {
        //             color: '#554226',
        //             enabled: true,
        //         },
        //         {
        //             color: '#03162D',
        //             enabled: true,
        //         },
        //         {
        //             color: '#002027',
        //             enabled: true,
        //         },
        //         {
        //             color: '#020210',
        //             enabled: true,
        //         },
        //         {
        //             color: '#02152A',
        //             enabled: true,
        //         },
        //     ],
        //     speed: 2,
        //     horizontalPressure: 3,
        //     verticalPressure: 5,
        //     waveFrequencyX: 1,
        //     waveFrequencyY: 3,
        //     waveAmplitude: 8,
        //     shadows: 0,
        //     highlights: 2,
        //     colorBrightness: 1,
        //     colorSaturation: 6,
        //     wireframe: false,
        //     colorBlending: 7,
        //     backgroundColor: '#003FFF',
        //     backgroundAlpha: 1,
        //     grainScale: 2,
        //     grainSparsity: 0,
        //     grainIntensity: 0.175,
        //     grainSpeed: 1,
        //     resolution: 1,
        // }
        gradientRef.current = new NeatGradient({
            ref: canvasRef.current,
            colors: [
                {
                    color: '#001010',
                    enabled: true,
                },
                {
                    color: '#0C0500',
                    enabled: true,
                },
                {
                    color: '#160F00',
                    enabled: true,
                },
                {
                    color: '#0E0808',
                    enabled: true,
                },
                {
                    color: '#0C223B',
                    enabled: true,
                },
            ],
            speed: 1,
            horizontalPressure: 5,
            verticalPressure: 5,
            waveFrequencyX: 3,
            waveFrequencyY: 2,
            waveAmplitude: 1,
            shadows: 0,
            highlights: 0,
            colorBrightness: 1,
            colorSaturation: 0,
            wireframe: false,
            colorBlending: 5,
            backgroundColor: "#010101",
            backgroundAlpha: 1,
            grainScale: 2,
            grainSparsity: 0,
            grainIntensity: 0,
            grainSpeed: 1,
            resolution: 0.2,
            yOffset: 0
        });

        return gradientRef.current.destroy;

    }, [canvasRef.current])

    return (
        <canvas
            // className={"bg-gray-100"}
            style={{
                position: "fixed",
                isolation: "isolate",
                height: "100vh",
                width: "100%",
                top: "0px",
                left: "0px",
                right: 0,
            }}
            ref={canvasRef}
        />
    );

}
