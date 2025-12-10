import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RepeatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"repeat"} ref={ref}/>
});

RepeatIcon.displayName = "RepeatIcon";
