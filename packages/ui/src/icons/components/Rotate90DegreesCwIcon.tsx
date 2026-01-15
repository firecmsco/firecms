import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Rotate90DegreesCwIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rotate_90_degrees_cw"} ref={ref}/>
});

Rotate90DegreesCwIcon.displayName = "Rotate90DegreesCwIcon";
