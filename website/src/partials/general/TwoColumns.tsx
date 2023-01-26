import React from "react";
import { ContainerMixin } from "../utils";

export function TwoColumns({
                               left,
                               right
                           }: { left: React.ReactNode, right: React.ReactNode }) {
    return (
        <div className="relative mx-auto my-20">
            <div className={"p-4 " +  ContainerMixin} >
                <div className="lg:grid lg:grid-cols-12 lg:gap-6">
                    <div
                        className="max-w-7xl lg:max-w-none lg:w-full mx-auto lg:col-span-6 lg:pr-4 lg:pr-12 xl:pr-16 flex justify-center flex-col h-full"
                        data-aos="fade-right"
                    >
                        {left}
                    </div>

                    <div
                        className="max-w-7xl lg:max-w-none lg:w-full mx-auto  lg:col-span-6 lg:order-1 flex justify-center flex-col h-full"
                        data-aos="fade-left"
                    >
                        {right}
                    </div>
                </div>
            </div>
        </div>
    )
}
