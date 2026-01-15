import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShuffleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shuffle"} ref={ref}/>
});

ShuffleIcon.displayName = "ShuffleIcon";
