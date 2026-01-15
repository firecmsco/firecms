import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AlignHorizontalCenterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"align_horizontal_center"} ref={ref}/>
});

AlignHorizontalCenterIcon.displayName = "AlignHorizontalCenterIcon";
