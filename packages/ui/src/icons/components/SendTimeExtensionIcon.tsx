import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SendTimeExtensionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"send_time_extension"} ref={ref}/>
});

SendTimeExtensionIcon.displayName = "SendTimeExtensionIcon";
