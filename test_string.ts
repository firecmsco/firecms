interface Translations {
    save: string;
    cancel: string;
}

function t(key: keyof Translations | (string & {})): string {
    return key;
}

// These should all work:
t("save");       
t("unknown");    
