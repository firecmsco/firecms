import React, { useEffect, useRef, useState } from "react";
import { ContainerMixin, ContainerPaddingMixin, CTACaret, defaultBorderMixin } from "../styles";
import clsx from "clsx";
import { LinedSpace } from "../layout/LinedSpace";
import { Tip } from "./Tip";
import { AppLink } from "../../AppLink";

export function FireCMSCloudVersions() {

    // Currency state (eur | usd)
    const [currency, setCurrency] = useState<"eur" | "usd">("eur");
    // Currency actually displayed (lags during animation)
    const [displayCurrency, setDisplayCurrency] = useState<typeof currency>(currency);
    const [fading, setFading] = useState(false);

    // Refs for timers to ensure proper cleanup
    const midTimerRef = useRef<number | null>(null);
    const endTimerRef = useRef<number | null>(null);
    const prefersReducedMotion = useRef(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            prefersReducedMotion.current = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        }
    }, []);

    useEffect(() => {
        // Clear any existing timers
        if (midTimerRef.current) window.clearTimeout(midTimerRef.current);
        if (endTimerRef.current) window.clearTimeout(endTimerRef.current);

        if (currency === displayCurrency) {
            // Nothing to animate
            setFading(false);
            return undefined; // explicit
        }

        if (prefersReducedMotion.current) {
            setDisplayCurrency(currency);
            setFading(false);
            return undefined; // explicit
        }

        setFading(true);
        // Fade out then swap
        midTimerRef.current = window.setTimeout(() => {
            setDisplayCurrency(currency);
        }, 140);
        // Fade back in
        endTimerRef.current = window.setTimeout(() => {
            setFading(false);
        }, 200);

        return () => {
            if (midTimerRef.current) window.clearTimeout(midTimerRef.current);
            if (endTimerRef.current) window.clearTimeout(endTimerRef.current);
        };
    }, [currency]);

    // Fixed price map; adjust USD values if official pricing differs.
    const priceMap = {
        cloud: {
            eur: 9.99,
            usd: 11.99
        },
        pro: {
            eur: 149.99,
            usd: 199.99
        },
        free: {
            eur: 0,
            usd: 0
        }
    } as const;

    const symbol = displayCurrency === "eur" ? "€" : "$";

    function format(amount: number) {
        return amount === 0 ? `${symbol}0` : `${symbol}${amount.toFixed(2)}`;
    }

    const priceAnim = (extra?: string) => clsx(
        "inline-block transition-all motion-reduce:transition-none duration-200 ease-out will-change-transform will-change-opacity",
        fading ? "opacity-0 motion-safe:-translate-y-1 motion-safe:scale-95 motion-safe:blur-[1px]" : "opacity-100 motion-safe:translate-y-0 motion-safe:scale-100 motion-safe:blur-0",
        extra
    );

    const communityTier = (
        <div
            className={clsx("bg-white w-full max-w-xl lg:max-w-none h-full p-6 border rounded-lg  flex flex-col", defaultBorderMixin)}>

            <h3 className={"text-3xl md:text-4xl font-bold text-gray-500 uppercase my-2"}>
                Community
            </h3>

            <p className={"text-lg mb-4 font-bold h-16"}>
                MIT licensed first-class CMS/admin panel
            </p>

            <div className={"my-4 text-gray-700 w-full"}>
                <span className={priceAnim("text-3xl font-bold")}>{format(priceMap.free[displayCurrency])} user/month</span>
            </div>

            <div className={"grow mt-4"}>
                <ul className={"pl-4"}>
                    <li className={"list-disc ml-2"}>
                        <Tip tip={"Easily connect to your Firebase and MongoDB Atlas databases."}>
                            Seamless integration with Firebase and MongoDB Atlas
                        </Tip>
                    </li>
                    <li className={"list-disc ml-2"}><Tip tip={"Plus too many to count validation options"}>Access to a
                        40+ first class components library</Tip></li>
                    <li className={"list-disc ml-2"}><Tip
                        tip={"Customize your forms with React components"}>Custom form fields and custom views</Tip>
                    </li>
                    <li className={"list-disc ml-2"}><Tip tip={"Enjoy a robust, lightweight editor"}>Notion-style Markdown editor </Tip>
                    </li>
                    <li className={"list-disc ml-2"}><Tip tip={"Change your logo, theme, colors, fonts, home page, form fields, custom views..."}>Full CMS customization</Tip></li>
                </ul>
            </div>

        </div>
    );

    const cloud = (
        <div
            className={clsx("bg-white w-full max-w-xl lg:max-w-none h-full p-6 rounded-lg flex flex-col outline-none ring-2 ring-primary ring-opacity-75 ring-offset-2 ring-offset-transparent")}>

            <h3 className={"text-3xl md:text-4xl font-bold   my-2"}>
                FireCMS Cloud
            </h3>
            <p className={"text-lg mb-4 font-bold h-16"}>
                Perfect for projects that just need a working solution
            </p>

            <div className={" mt-4 w-full"}>
                {/*<span className={"text-2xl block font-bold line-through"}>€11.99 user/month</span>*/}
                <span className={priceAnim("text-3xl font-bold text-primary")}>{format(priceMap.cloud[displayCurrency])} user/month</span>
            </div>

            <div className={"flex flex-row gap-4 my-6"}>

                <AppLink
                    className={"h-fit text-sm btn btn-sm py-2 px-3 text-white bg-primary  hover:bg-blue-700  hover:text-white uppercase border-solid rounded "}
                    href="https://app.firecms.co"
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={() => {
                        if (typeof window !== "undefined" && (window as any).gtag) {
                            (window as any).gtag("event", "go_to_app", {
                                event_category: "pricing",
                                event_label: "cloud_versions"
                            });
                        }
                    }}
                >
                    One month free trial
                    <CTACaret/>
                </AppLink>
            </div>

            <div className={"grow"}>
                <ul className={"pl-4"}>
                    <li className={"list-disc ml-2"}><Tip tip={"Always up to date, including your own custom code"}>Fully managed service</Tip></li>
                    <li className={"list-disc ml-2"}>Everything in the community version</li>
                    <li className={"list-disc ml-2"}><Tip tip={"Customise your views, form fields, navigation routes, custom views and more, using module federation"}>Custom code</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Instantly search through your data with powerful query capabilities."}>Local text search</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Create as many data collections as you need."}>Unlimited collections</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Easily migrate or backup your data."}>Data import and export</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Personalize the appearance of your CMS to match your brand."}>Theme and logo customization</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Leverage the latest AI models to generate smart content."}>AI content generation</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Utilize additional databases for extended functionality."}>Secondary databases</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Ensure application security with AppCheck integration."}>AppCheck</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Fine-tune user permissions and roles for your team."}>User and role management</Tip></li>
                </ul>
            </div>

        </div>
    );

    const proTier = (
        <div
            className={clsx("bg-white w-full max-w-xl lg:max-w-none h-full p-6 border rounded-lg  flex flex-col", defaultBorderMixin)}>

            <h3 className={"text-3xl md:text-4xl font-bold  text-gray-700 uppercase my-2"}>
                Pro
            </h3>
            <p className={"text-lg mb-4 font-bold h-16"}>
                Perfect for startups, enterprise or agencies.
            </p>
            <div className={"mt-4  text-gray-800 w-full"}>
                <span className={priceAnim("text-3xl font-bold")}>{format(priceMap.pro[displayCurrency])} project/month</span>
            </div>
            <div className={"w-fit my-6 flex flex-row gap-2"}>
                <div
                    className={"rounded-lg w-fit h-fit font-regular m-auto gap-1 text-ellipsis px-4 py-1.5 text-sm font-semibold"}
                    style={{
                        backgroundColor: "rgb(255, 214, 110)",
                        color: "rgb(59, 37, 1)"
                    }}>
                    TRY OUT FOR FREE
                </div>
                <a className={clsx("btn px-4 py-2  uppercase rounded border-solid text-base dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 dark:hover:border-gray-800 ")}
                   href="/pro">
                    More info
                </a>
            </div>

            <div className={"grow"}>
                <ul className={"pl-4"}>
                    <li className={"list-disc ml-2"}><Tip tip={"Easily design and infer data schemas for your project."}>Self-hosted</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Easily design and infer data schemas for your project."}>Schema editor and data inference</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Manage complex data migrations with advanced tools."}>Advanced data import and export</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Edit content seamlessly with an intuitive Notion-like interface."}>Notion-style editor</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Instantly search through your data with powerful query capabilities."}>Local text search</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Fine-tune user permissions and roles for your team."}>User and role management</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Implement tailored authentication methods and precise access controls."}>Custom authentication and access control</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Extend functionality with our full range of plugins."}>Access to all FireCMS plugins</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Fully customize your CMS components to suit your needs."}>Full CMS components customization</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Get faster assistance with our priority support."}>Priority support</Tip></li>
                    <li className={"list-disc ml-2"}><Tip tip={"Influence the development of future features through roadmap prioritization."}>Roadmap prioritization</Tip></li>
                </ul>
            </div>

        </div>
    );

    return <section
        className={clsx(defaultBorderMixin, "flex flex-col text-gray-900 items-center justify-center text-lg border-0 border-t bg-gray-100 z-10")}>

        <div
            className={clsx(ContainerMixin, ContainerPaddingMixin, defaultBorderMixin, "flex flex-col gap-8 border-r border-l border-t-0 border-b-0")}>
            {/* Description */}
            <div className="max-w-4xl mx-auto w-full">
                <p className={"max-w-6xl mx-auto mt-0 mb-0"}>
                    <strong>FireCMS Cloud</strong> offers a complete, end-to-end
                    solution for businesses that require the highest level of
                    support and security. With dedicated hosting, advanced features, and
                    expert support, you&#39;ll have everything you need to take your project
                    to the next level.
                </p>
            </div>

            <div className="mt-2 mb-2 flex justify-center w-full">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                    <div className="inline-flex items-center gap-1">
                        <button
                            onClick={() => setCurrency("eur")}
                            aria-pressed={currency === "eur"}
                            className={clsx(
                                "px-2 py-0.5 rounded font-medium transition-colors",
                                currency === "eur"
                                    ? "text-gray-800  bg-gray-200 border border-gray-300"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >EUR €
                        </button>
                        <span className="text-gray-400">/</span>
                        <button
                            onClick={() => setCurrency("usd")}
                            aria-pressed={currency === "usd"}
                            className={clsx(
                                "px-2 py-0.5 rounded font-medium transition-colors",
                                currency === "usd"
                                    ? "text-gray-800 bg-gray-200 border border-gray-300"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >USD $
                        </button>
                    </div>
                </div>
            </div>

            {/* Pricing cards */}
            <div
                className="flex flex-col items-center md:grid md:grid-cols-3 gap-4 w-full mx-auto"
            >
                {communityTier}
                {cloud}
                {proTier}
            </div>


        </div>
        <LinedSpace position={"top"} size={"medium"}/>
    </section>;

}
