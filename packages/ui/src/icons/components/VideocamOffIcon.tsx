import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VideocamOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"videocam_off"} ref={ref}/>
});

VideocamOffIcon.displayName = "VideocamOffIcon";
