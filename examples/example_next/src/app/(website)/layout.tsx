import type { Metadata } from "next";
import Image from 'next/image'
import NextTopLoader from 'nextjs-toploader';

import logo from "@/app/common/toleroo_logo.png";
import Link from "next/link";

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
        <NextTopLoader color={"#ef8163"}/>

        <main className={"relative w-full min-h-[100dvh] flex flex-row"}>
            <div
                className={"sticky top-0 h-full min-h-[100dvh] flex flex-col w-[280px] overflow-auto p-4 bg-white border-r border-1 border-gray-100"}>
                <div className={"flex-grow"}>
                    <Link href={"/recipes"}>
                        <Image
                            className={"my-4"}
                            src={logo}
                            width={120}
                            // height={500}
                            alt="Logo"
                        />

                    </Link>
                </div>
                <div className={"flex flex-col gap-2"}>
                    <a className={"text-text-secondary text-sm"}>Medical disclaimer</a>
                    <a className={"text-text-secondary text-sm"}>Contact</a>
                    <a className={"text-text-secondary text-sm"}>Legal</a>
                </div>
            </div>

            {children}

            {/*<Footer/>*/}
        </main>


        </body>
        </html>
    );
}


function Footer() {
    return <div className="bg-[rgb(142,164,159)] text-white py-16 w-full">
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                <div className="mb-6">
                    <div className="flex items-center mb-2">
                            <span className="">
            <a href="mailto:hallo@toleroo.de?subject=Kontaktanfrage%20%C3%BCber%20Website"
               className="hover:underline">hallo@toleroo.de</a>
          </span>
                    </div>

                    <div className="flex items-center mb-2">
                            <span className="">
            <a href="https://www.calendly.com/toleroo" className="hover:underline">Termin buchen</a>
          </span>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold my-4">Folge mir auf:</h2>

                        <div className="flex flex-col space-y-2">
                            <a href="https://instagram.com/antonie.isabella?igshid=NzZlODBkYWE4Ng=="
                               className="hover:underline">Instagram</a>
                            <a href="https://www.tiktok.com/@antonie.isabella" className="hover:underline">TikTok</a>
                        </div>

                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-4">Menü</h2>
                    <div className="flex flex-col space-y-2">
                        <a href="https://toleroo.de/#bereit-dich-fit-zu-kochen" className="hover:underline">Wie es
                            funktioniert</a>
                        <a href="https://toleroo.de/#unser-angebot" className="hover:underline">Mein Angebot</a>
                        <a href="https://toleroo.de/#kundenstimmen" className="hover:underline">Kundenstimmen</a>
                        <a href="https://toleroo.de/#faqs" className="hover:underline">FAQs</a>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-4">Unternehmen</h2>
                    <div className="flex flex-col space-y-2">
                        <a href="https://toleroo.de/#meine-mission" className="hover:underline">Über mich</a>
                        <a href="https://toleroo.de/karriere/" className="hover:underline">Karriere</a>
                        <a href="https://toleroo.de/impressum/" className="hover:underline">Impressum</a>
                        <a href="https://toleroo.de/datenschutz/" className="hover:underline">Datenschutz</a>
                        <a href="https://toleroo.de/agb/" className="hover:underline">AGB</a>
                        <a href="https://toleroo.de/widerruf/" className="hover:underline">Widerrufsrecht</a>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-bold mb-4">Kostenlose Beratung</h2>
                    <div className="mb-4">
                        Finde heraus, wie Toleroo dich dabei unterstützen kann, deine Ziele zu erreichen. Buche
                        jetzt eine telefonische Beratung mit mir - 100% kostenlos.
                    </div>
                    <a href="https://www.calendly.com/toleroo"
                       className="btn bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded">Termin
                        buchen</a>
                </div>

            </div>
        </div>
    </div>;
}
