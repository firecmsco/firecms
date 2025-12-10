import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AlignHorizontalRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"align_horizontal_right"} ref={ref}/>
});

AlignHorizontalRightIcon.displayName = "AlignHorizontalRightIcon";
