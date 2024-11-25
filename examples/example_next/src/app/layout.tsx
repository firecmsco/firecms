import type { Metadata } from "next";

import "@/app/common/index.css";
import "@fontsource/montserrat";
import "@fontsource/poppins";
import "@fontsource/playfair-display";
import "@fontsource/jetbrains-mono";

export const metadata: Metadata = {
    title: "Toleroo",
    description: "Deine Rezepte für entspanntes Kochen und Schlemmen trotz Unverträglichkeiten.",
};


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
        <body>

        {children}

        </body>
        </html>
    );
}

