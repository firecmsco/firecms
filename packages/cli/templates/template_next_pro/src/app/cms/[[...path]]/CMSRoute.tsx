"use client";

import { FireCMSRouter } from "@firecms/core";
import { useEffect, useState } from "react";
import { App } from "../App";

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
