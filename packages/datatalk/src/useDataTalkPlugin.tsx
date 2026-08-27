import React from "react";
import { FireCMSPlugin } from "@firecms/core";
import { DataTalkProvider, useBuildDataTalkConfig } from "./DataTalkProvider";
import { datatalkTranslationsEn } from "./locales/en";
import { FirebaseApp } from "firebase/app";
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
        // Only English is bundled; the rest load when that language is selected.
        // Seven languages of strings in every plugin bundle is dead weight for
        // the six nobody is reading.
            en: datatalkTranslationsEn,
            es: () => import("./locales/es").then((m) => m.datatalkTranslationsEs),
            de: () => import("./locales/de").then((m) => m.datatalkTranslationsDe),
            fr: () => import("./locales/fr").then((m) => m.datatalkTranslationsFr),
            it: () => import("./locales/it").then((m) => m.datatalkTranslationsIt),
            hi: () => import("./locales/hi").then((m) => m.datatalkTranslationsHi),
            pt: () => import("./locales/pt").then((m) => m.datatalkTranslationsPt)
        }
    } satisfies FireCMSPlugin), [config]);
}
