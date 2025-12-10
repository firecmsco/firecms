import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SdCardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sd_card"} ref={ref}/>
});

SdCardIcon.displayName = "SdCardIcon";
