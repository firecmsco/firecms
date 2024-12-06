import React from "react";

import type { Metadata } from "next";

import NextTopLoader from 'nextjs-toploader';
import { Providers } from "./Providers";
import { Header } from "@/app/(website)/components/Header";
import { Footer } from "@/app/(website)/components/Footer";

export const metadata: Metadata = {
    title: "FireCMS e-commerce and blog demo",
    description: "This is a demo for using FireCMS as an e-commerce backend",
    generator: "FireCMS",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {


    return (
        <html lang="en">
        <body>
        <NextTopLoader color={"#16D6D1"}/>

        <main className={"relative w-full min-h-[100dvh] flex flex-col"}>

            <Header/>

            <Providers>
                {children}
            </Providers>

            <Footer/>
        </main>

        </body>
        </html>
    );
}


