import React from "react";
import * as Realm from "realm-web";

export type AppConfiguration = {
    appId: string;
    appUrl: string;
    baseUrl: string;
    clientApiBaseUrl: string;
    dataApiBaseUrl: string;
    dataExplorerLink: string;
    dataSourceName: string;
};

function createApp(appId: string, baseUrl:string) {
    return new Realm.App({ id: appId, baseUrl });
}

export function useInitRealmMongodb({ appId, baseUrl }: AppConfiguration) {
    const [app, setApp] = React.useState(createApp(appId, baseUrl));
    React.useEffect(() => {
        setApp(createApp(appId, baseUrl));
    }, []);

    return { app };

}
