import React from "react";

export function AnimatedGradientBackground({ translateY }: { translateY?: number }) {

    return <div className="gradient-background-container -z-10" aria-hidden="true"
                style={{
                    transform: `translateY(${translateY ?? 0}px)`,
                }}
    >
        <div className="blob blob-1"/>
        <div className="blob blob-2"/>
        <div className="blob blob-3"/>
        <div className="blob blob-4"/>
    </div>;
}
