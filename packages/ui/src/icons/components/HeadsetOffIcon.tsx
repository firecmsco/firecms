import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HeadsetOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"headset_off"} ref={ref}/>
});

HeadsetOffIcon.displayName = "HeadsetOffIcon";
