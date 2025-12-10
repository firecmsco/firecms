import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HorizontalSplitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"horizontal_split"} ref={ref}/>
});

HorizontalSplitIcon.displayName = "HorizontalSplitIcon";
