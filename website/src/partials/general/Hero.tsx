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
        <div className="relative overflow-hidden">
            <div className={ContainerMixin}>
                <div
                    className="relative pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
                    <div
                        className="mt-10 mx-auto max-w-6xl  sm:mt-12  md:mt-16 lg:mt-20 ">
                        <div className="sm:text-center lg:text-left">
                            <h1 className="text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl">
                                {title}
                            </h1>
                            {subtitle &&
                                <p className="mt-3 text-xl sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                                    {subtitle}
                                </p>}
                            <div
                                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                {cta}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
