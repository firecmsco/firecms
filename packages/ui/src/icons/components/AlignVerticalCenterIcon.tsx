import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AlignVerticalCenterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"align_vertical_center"} ref={ref}/>
});

AlignVerticalCenterIcon.displayName = "AlignVerticalCenterIcon";
