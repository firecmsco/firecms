import { FireCMSCloudAppProps } from "./FireCMSCloudAppProps";
import { FireCMSCloudApp } from "./FireCMSCloudApp";
import { useEffect } from "react";

export function FireCMSApp(props: FireCMSCloudAppProps) {

    useEffect(() => {
        console.warn("IMPORTANT! The FireCMSApp component is deprecated and will be removed in future versions. Please use FireCMSCloudApp instead.");
    }, []);

    return <FireCMSCloudApp {...props} />;
}
