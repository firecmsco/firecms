import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HevcIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hevc"} ref={ref}/>
});

HevcIcon.displayName = "HevcIcon";
