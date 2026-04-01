import React from "react";
import { CheckIcon, IconButton, Menu, MenuItem, TranslateIcon, Typography } from "@rebasepro/ui";
import { useTranslation } from "../hooks";

export function LanguageToggle() {
    const { i18n } = useTranslation();

    return (
        <Menu
            trigger={<IconButton
                color="inherit"
                aria-label="Change language">
                <TranslateIcon size="small" />
            </IconButton>}>
            <MenuItem onClick={() => i18n.changeLanguage("en")}>
                <div className="flex w-full items-center justify-between gap-4">
                    {/* eslint-disable-next-line i18next/no-literal-string */}
                    <Typography variant="body2" className={i18n.language === "en" ? "font-bold" : ""}>English</Typography>
                    {i18n.language === "en" && <CheckIcon size="small" />}
                </div>
            </MenuItem>
            <MenuItem onClick={() => i18n.changeLanguage("es")}>
                <div className="flex w-full items-center justify-between gap-4">
                    {/* eslint-disable-next-line i18next/no-literal-string */}
                    <Typography variant="body2" className={i18n.language === "es" ? "font-bold" : ""}>Español</Typography>
                    {i18n.language === "es" && <CheckIcon size="small" />}
                </div>
            </MenuItem>
            <MenuItem onClick={() => i18n.changeLanguage("de")}>
                <div className="flex w-full items-center justify-between gap-4">
                    {/* eslint-disable-next-line i18next/no-literal-string */}
                    <Typography variant="body2" className={i18n.language === "de" ? "font-bold" : ""}>Deutsch</Typography>
                    {i18n.language === "de" && <CheckIcon size="small" />}
                </div>
            </MenuItem>
            <MenuItem onClick={() => i18n.changeLanguage("fr")}>
                <div className="flex w-full items-center justify-between gap-4">
                    {/* eslint-disable-next-line i18next/no-literal-string */}
                    <Typography variant="body2" className={i18n.language === "fr" ? "font-bold" : ""}>Français</Typography>
                    {i18n.language === "fr" && <CheckIcon size="small" />}
                </div>
            </MenuItem>
            <MenuItem onClick={() => i18n.changeLanguage("it")}>
                <div className="flex w-full items-center justify-between gap-4">
                    {/* eslint-disable-next-line i18next/no-literal-string */}
                    <Typography variant="body2" className={i18n.language === "it" ? "font-bold" : ""}>Italiano</Typography>
                    {i18n.language === "it" && <CheckIcon size="small" />}
                </div>
            </MenuItem>
            <MenuItem onClick={() => i18n.changeLanguage("hi")}>
                <div className="flex w-full items-center justify-between gap-4">
                    {/* eslint-disable-next-line i18next/no-literal-string */}
                    <Typography variant="body2" className={i18n.language === "hi" ? "font-bold" : ""}>हिन्दी</Typography>
                    {i18n.language === "hi" && <CheckIcon size="small" />}
                </div>
            </MenuItem>
            <MenuItem onClick={() => i18n.changeLanguage("pt")}>
                <div className="flex w-full items-center justify-between gap-4">
                    {/* eslint-disable-next-line i18next/no-literal-string */}
                    <Typography variant="body2" className={i18n.language === "pt" ? "font-bold" : ""}>Português</Typography>
                    {i18n.language === "pt" && <CheckIcon size="small" />}
                </div>
            </MenuItem>
        </Menu>
    );
}
