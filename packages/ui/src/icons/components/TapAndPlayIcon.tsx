import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TapAndPlayIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"tap_and_play"} ref={ref}/>
});

TapAndPlayIcon.displayName = "TapAndPlayIcon";
