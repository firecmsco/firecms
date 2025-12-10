import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SdCardAlertIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sd_card_alert"} ref={ref}/>
});

SdCardAlertIcon.displayName = "SdCardAlertIcon";
