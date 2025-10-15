import React from "react";
import { ContainerInnerPaddingMixin } from "../styles";
import { Panel } from "../general/Panel";
import clsx from "clsx";

export function PricingQuote() {

    const ikeaQuote = {
        quote: "I think you have the best noSQL headless CMS on the market",
        author: "Viktor Vinnk",
        avatar: "/img/avatars/viktor.jpeg",
        role: "Country Digital Development Leader, Ikea"
    };
    const {
        quote,
        author,
        avatar,
        role
    } = ikeaQuote;
    return <>

        <Panel includePadding={false} color={"white"} innerClassName={"flex flex-col items-center justify-center"}>

            <div className={ContainerInnerPaddingMixin}>

                <div
                    className={clsx(
                        "my-16",
                        "flex flex-col",
                        "max-w-[540px] min-w-[380px] relative flex flex-col items-center justify-center px-8 py-6 rounded-2xl",)}>

                    <div className={"flex-grow flex flex-col items-center justify-center"}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={"text-inherit"} width="24"
                             height="24" viewBox="0 0 24 24">
                            <path
                                d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
                        </svg>

                        <p className="mb-4 text-4xl mt-4 font-bold leading-snug tracking-tight text-center">
                            {quote}
                        </p>
                    </div>

                    <img loading="lazy"
                         className="w-10 h-10 mt-4 rounded-full object-cover"
                         src={avatar}
                         alt={author}/>
                    <cite
                        className="not-italic	block mt-4 text-md font-bold uppercase text-center">~ {author}</cite>
                    <cite
                        className="not-italic	block mt-2 text-sm font-bold uppercase text-center">{role}</cite>
                </div>
            </div>
        </Panel>
    </>

}

function getEntryClass(value: React.ReactNode) {
    if (value === "Yes")
        return "bg-green-100 text-green-900";
    if (value === "Pro")
        return "bg-blue-100 text-blue-900 font-bold";
    if (value === "Plus" || value === "Enterprise")
        return "bg-blue-100 text-blue-900";
    if (value === "WIP")
        return "bg-yellow-100 text-yellow-900";
    return "";
}
