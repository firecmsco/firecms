import React from "react";
import { ContainerMixin } from "../utils";

export function Hero({
                         title,
                         subtitle,
                         cta
                     }: {
    title: React.ReactNode,
    subtitle?: React.ReactNode,
    cta?: React.ReactNode,
}) {
    return (
        <section className={ContainerMixin + " my-8"}>
            <div style={{height: "120px"}}/>
            <div
                className="mt-10 mx-auto max-w-7xl ">
                <div className="lg:text-left">
                    <h1 className="text-4xl tracking-tight font-extrabold md:text-6xl">
                        {title}
                    </h1>
                    {subtitle &&
                        <div className="mt-3 text-xl sm:mt-4 md:text-2xl">
                            {subtitle}
                        </div>}
                    <div
                        className="mt-5 sm:mt-8">
                        {cta}
                    </div>
                </div>
            </div>
        </section>
    );
}
