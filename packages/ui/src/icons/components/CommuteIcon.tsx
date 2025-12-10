import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CommuteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"commute"} ref={ref}/>
});

CommuteIcon.displayName = "CommuteIcon";
