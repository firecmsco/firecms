"use client";

import { App } from "../App";
import { useEffect, useState } from "react";
import { FireCMSRouter } from "@firecms/core";

export function CMSRoute(){
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])
    if (!mounted) return null;

    return <FireCMSRouter basePath={"/cms"}>
        <App/>
    </FireCMSRouter>;
}
