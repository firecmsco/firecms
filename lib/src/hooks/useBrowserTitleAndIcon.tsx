import { useEffect } from "react";
import fireCMSLogo from "../assets/favicon-96x96.png";

/**
 * Internal hook to handle the browser title and icon
 * @param name
 * @param logo
 */
export function useBrowserTitleAndIcon(name: string, logo?: string) {
    useEffect(() => {
        if (document) {
            document.title = `${name} - FireCMS`;
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement("link");
                // @ts-ignore
                link.rel = "icon";
                document.getElementsByTagName("head")[0].appendChild(link);
            }
            // @ts-ignore
            link.href = logo ?? fireCMSLogo;
        }
    }, [name, logo]);
}
