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
        <div className={"m-4 w-full"}>
            <Button className={cls("w-full bg-white text-gray-900 dark:text-gray-900", disabled ? "" : "hover:text-white hover:dark:text-white")}
                    style={{
                        height: "40px",
                        borderRadius: "4px",
                        fontSize: "14px"
                    }}
                    variant="filled"
                    disabled={disabled}
                    onClick={onClick}>
                <div
                    className={cls("flex items-center justify-items-center ")}>
                    <div className="flex flex-col items-center justify-center w-4.5 h-4.5">
                        {googleIcon()}
                    </div>
                    <div
                        className={cls("flex-grow pl-6 text-left")}>
                        {"Sign in with Google"}
                    </div>
                </div>
            </Button>

        </div>
    )
}
