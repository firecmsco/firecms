import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AlignHorizontalLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"align_horizontal_left"} ref={ref}/>
});

AlignHorizontalLeftIcon.displayName = "AlignHorizontalLeftIcon";
