import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VerticalSplitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vertical_split"} ref={ref}/>
});

VerticalSplitIcon.displayName = "VerticalSplitIcon";
