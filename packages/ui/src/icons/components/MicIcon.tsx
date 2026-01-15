import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MicIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mic"} ref={ref}/>
});

MicIcon.displayName = "MicIcon";
