import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FormatShapesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"format_shapes"} ref={ref}/>
});

FormatShapesIcon.displayName = "FormatShapesIcon";
