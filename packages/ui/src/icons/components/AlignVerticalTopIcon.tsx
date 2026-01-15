import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AlignVerticalTopIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"align_vertical_top"} ref={ref}/>
});

AlignVerticalTopIcon.displayName = "AlignVerticalTopIcon";
