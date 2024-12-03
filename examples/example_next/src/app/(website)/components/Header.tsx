import React from "react";
import Image from 'next/image'
import logo from "@/app/common/logo.svg";
import Link from "next/link";
import { HeaderLink } from "@/app/(website)/components/HeaderLink";

export function Header() {

    return <header
        className={"px-4 sticky top-0 w-full min-w-[100dvw] flex flex-row h-[56px] p-1 border-b border-1 border-surface-100 bg-white z-10"}>
        <div className={"flex-grow flex flex-row gap-8 items-center"}>
            <Link href={"/"}>
                <Image
                    className={"m-2 "}
                    src={logo}
                    height={32}
                    alt="Logo"
                />
            </Link>
            <HeaderLink href="/products">Products</HeaderLink>
            <HeaderLink href="/blog">Blog</HeaderLink>
        </div>
    </header>
}
