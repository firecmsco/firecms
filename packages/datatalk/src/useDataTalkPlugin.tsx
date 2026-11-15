import React from "react";
import { FireCMSPlugin } from "@firecms/core";
import { DataTalkProvider, useBuildDataTalkConfig } from "./DataTalkProvider.js";
import { datatalkTranslationsEn } from "./locales/en.js";
import { FirebaseApp } from "firebase/app";
import { SchemaContext } from "./utils/schemaContext.js";

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
            es: () => import("./locales/es.js").then((m) => m.datatalkTranslationsEs),
            de: () => import("./locales/de.js").then((m) => m.datatalkTranslationsDe),
            fr: () => import("./locales/fr.js").then((m) => m.datatalkTranslationsFr),
            it: () => import("./locales/it.js").then((m) => m.datatalkTranslationsIt),
            hi: () => import("./locales/hi.js").then((m) => m.datatalkTranslationsHi),
            pt: () => import("./locales/pt.js").then((m) => m.datatalkTranslationsPt)
        }
    } satisfies FireCMSPlugin), [config]);
}
