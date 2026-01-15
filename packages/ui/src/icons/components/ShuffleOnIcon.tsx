import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShuffleOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shuffle_on"} ref={ref}/>
});

ShuffleOnIcon.displayName = "ShuffleOnIcon";
