import React from "react";
import clsx from "clsx";
import { defaultBorderMixin } from "./styles";
import { Panel } from "./general/Panel";
import { LinedSpace } from "./layout/LinedSpace";

import { softwareApplicationSchema } from "../partials/markup";

const quotes = [
    {
        quote: "I've tried many other CMS including Strapi, Sanity, contentful, Builder.io, none of them gave me better experience than FireCMS!",
        author: "Fulei Huang",
        avatar: "/img/avatars/fulei.avif",
        role: "Software Engineer, Microsoft"
    },
    {
        quote: "I think you have the best noSQL headless CMS on the market",
        author: "Viktor Vinnk",
        avatar: "/img/avatars/viktor.jpeg",
        role: "Country Digital Development Leader, Ikea"
    },
    {
        quote: "We are early adopters of FireCMS (and very proud of it) and it gives us a lot of flexibility and ease of integration of anything we develop.",
        author: "Manuel Pinilla",
        avatar: "/img/avatars/manuel.avif",
        role: "Founder, OikosBrain"
    },
    {
        quote: "So far, this has been the missing piece of the puzzle for running a Firebase back-end. I love how we can just throw some React in there and it all feels so seamless.",
        author: "John Coppa",
        avatar: "/img/avatars/john.avif",
        role: "CTO at EasyHome"
    },
    {
        quote: "It is a great initiative towards building a scalable and serverless CMS as Firebase is serverless. UI is very nice and working is very smooth.",
        author: "Muhammad Bilal",
        avatar: "/img/avatars/muhammad.avif",
        role: "Engineering, CodeViz Technology"
    },
];

const reviewSchema = quotes.map((quote, index) => ({
    "@context": "http://schema.org",
    "@type": "Review",
    "author": {
        "@type": "Person",
        "name": quote.author
    },
    "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
    },
    "reviewBody": quote.quote,
    "itemReviewed": softwareApplicationSchema
}));

export const QuotesSection: React.FC = () => {
    return (
        <Panel color={"lighter"} includePadding={false} container={false}>
            {/*<Head>*/}
            {/*    <script type="application/ld+json">*/}
            {/*        {JSON.stringify(reviewSchema)}*/}
            {/*    </script>*/}
            {/*</Head>*/}
            <div
                className="py-16 px-8 flex flex-row gap-4 overflow-auto no-scrollbar">
                {
                    quotes.map(({
                                    quote,
                                    avatar,
                                    author,
                                    role
                                }, i) => (
                        <blockquote key={`quote-${i}`}
                                    data-aos="fade-left"
                                    data-aos-delay={i * 50}
                                    className={clsx(
                                        "bg-white",
                                        "flex flex-col",
                                        "not-italic w-96 min-w-[380px] bg-gray-50 relative flex flex-col items-center justify-center px-8 py-6 rounded-2xl border", defaultBorderMixin)}>

                            <div className={"flex-grow flex flex-col items-center justify-center"}>
                                <svg xmlns="http://www.w3.org/2000/svg" className={"text-inherit"} width="24"
                                     height="24" viewBox="0 0 24 24">
                                    <path
                                        d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
                                </svg>

                                <p className="not-italic mb-4 text-2xl mt-4 font-bold leading-snug tracking-tight text-center">
                                    {quote}
                                </p>
                            </div>

                            <img loading="lazy"
                                 className="w-10 h-10 mt-4 rounded-full object-cover"
                                 src={avatar}
                                 alt={author}/>
                            <cite
                                className="not-italic	block mt-4 text-sm font-bold uppercase text-center">~ {author}</cite>
                            <cite
                                className="not-italic	block mt-2 text-xs font-bold uppercase text-center">{role}</cite>
                        </blockquote>

                    ))
                }
            </div>
            <LinedSpace position={"top"} size={"large"}/>
        </Panel>
    );
}

export default QuotesSection;
