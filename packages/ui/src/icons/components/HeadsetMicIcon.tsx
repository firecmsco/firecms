import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HeadsetMicIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"headset_mic"} ref={ref}/>
});

HeadsetMicIcon.displayName = "HeadsetMicIcon";
