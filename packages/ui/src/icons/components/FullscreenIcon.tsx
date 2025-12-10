import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FullscreenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fullscreen"} ref={ref}/>
});

FullscreenIcon.displayName = "FullscreenIcon";
