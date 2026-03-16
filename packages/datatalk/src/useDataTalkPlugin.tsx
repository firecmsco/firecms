import React from "react";
import { FireCMSPlugin } from "@firecms/core";
import { DataTalkProvider, useBuildDataTalkConfig } from "./DataTalkProvider";
import { datatalkTranslationsEn } from "./locales/en";
import { datatalkTranslationsEs } from "./locales/es";
import { datatalkTranslationsDe } from "./locales/de";
import { datatalkTranslationsFr } from "./locales/fr";
import { datatalkTranslationsIt } from "./locales/it";
import { datatalkTranslationsHi } from "./locales/hi";
import { datatalkTranslationsPt } from "./locales/pt";
import { FirebaseApp } from "@firebase/app";
import { SchemaContext } from "./utils/schemaContext";

export interface DataTalkPluginProps {
    enabled: boolean;
    firebaseApp?: FirebaseApp;
    userSessionsPath?: string;
    getAuthToken: () => Promise<string>;
    apiEndpoint?: string;
    loadSamplePrompts?: boolean;
    schemaContext?: SchemaContext;
    projectId?: string;
}

export function useDataTalkPlugin(props: DataTalkPluginProps): FireCMSPlugin {
    
    const config = useBuildDataTalkConfig(props);

    return React.useMemo(() => ({
        key: "datatalk",
        provider: {
            Component: DataTalkProvider,
            props: {
                config
            }
        },
        i18n: {
            en: datatalkTranslationsEn,
            es: datatalkTranslationsEs,
            de: datatalkTranslationsDe,
            fr: datatalkTranslationsFr,
            it: datatalkTranslationsIt,
            hi: datatalkTranslationsHi,
            pt: datatalkTranslationsPt
        }
    } satisfies FireCMSPlugin), [config]);
}
