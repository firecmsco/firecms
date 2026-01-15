import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Rotate90DegreesCcwIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rotate_90_degrees_ccw"} ref={ref}/>
});

Rotate90DegreesCcwIcon.displayName = "Rotate90DegreesCcwIcon";
