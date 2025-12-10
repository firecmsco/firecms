import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VerticalAlignCenterIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"vertical_align_center"} ref={ref}/>
});

VerticalAlignCenterIcon.displayName = "VerticalAlignCenterIcon";
