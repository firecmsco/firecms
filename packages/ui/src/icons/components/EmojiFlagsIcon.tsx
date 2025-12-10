import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EmojiFlagsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"emoji_flags"} ref={ref}/>
});

EmojiFlagsIcon.displayName = "EmojiFlagsIcon";
