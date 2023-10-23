import { useEffect } from "react";

const fireCMSLogo = "data:image/png;base64,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\n";

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
