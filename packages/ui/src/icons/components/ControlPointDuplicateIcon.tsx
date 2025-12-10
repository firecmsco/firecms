import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ControlPointDuplicateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"control_point_duplicate"} ref={ref}/>
});

ControlPointDuplicateIcon.displayName = "ControlPointDuplicateIcon";
