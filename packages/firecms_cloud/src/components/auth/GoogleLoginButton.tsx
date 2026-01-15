import { googleIcon } from "./social_icons";
import React from "react"

import { Button, cls } from "@firecms/ui";

export function GoogleLoginButton({
                                      onClick,
                                      disabled
                                  }: {
    onClick: () => void,
    disabled?: boolean
}) {
    return (
        <Button className={cls("w-full bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100", disabled ? "" : "hover:text-white dark:hover:text-white")}
                    style={{
                        height: "40px",
                        borderRadius: "4px",
                        fontSize: "14px"
                    }}

                    disabled={disabled}
                    onClick={onClick}>
                <div
                    className={cls("flex items-center justify-items-center ")}>
                    <div className="flex flex-col items-center justify-center w-4.5 h-4.5">
                        {googleIcon()}
                    </div>
                    <div
                        className={cls("grow pl-6 text-left")}>
                    {"Sign in with Google"}
                </div>
            </div>
        </Button>

    )
}
