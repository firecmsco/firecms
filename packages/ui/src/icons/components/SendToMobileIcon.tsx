import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SendToMobileIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"send_to_mobile"} ref={ref}/>
});

SendToMobileIcon.displayName = "SendToMobileIcon";
