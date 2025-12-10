import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HeadsetIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"headset"} ref={ref}/>
});

HeadsetIcon.displayName = "HeadsetIcon";
