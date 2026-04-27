import { googleIcon } from "./social_icons";
import React from "react"

import { Button, cls } from "@firecms/ui";
import { useTranslation } from "@firecms/core";

export function GoogleLoginButton({
                                      onClick,
                                      disabled
                                  }: {
    onClick: () => void,
    disabled?: boolean
}) {
    const { t } = useTranslation();
    return (
        <Button
            className={cls(
                "w-full text-surface-900 dark:text-surface-100",
                disabled ? "bg-white/70 dark:bg-surface-800/70" : "bg-white dark:bg-surface-800 hover:text-surface-800 hover:dark:text-white"
            )}
            style={{
                height: "40px",
                borderRadius: "4px",
                fontSize: "14px"
            }}

            disabled={disabled}
            onClick={onClick}>
            <div
                className="p-1 flex h-8 items-center justify-items-center">
                <div
                    className="flex flex-col w-8 items-center justify-items-center mr-4">
                    <div className="flex items-center justify-center w-[28px] h-[28px]">
                        {googleIcon()}
                    </div>
                </div>
                <div className="flex-grow pl-2 text-center">{t("sign_in_with_google")}</div>
            </div>
        </Button>

    )
}
