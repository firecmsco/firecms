import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TelegramIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"telegram"} ref={ref}/>
});

TelegramIcon.displayName = "TelegramIcon";
