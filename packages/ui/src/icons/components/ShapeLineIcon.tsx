import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ShapeLineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"shape_line"} ref={ref}/>
});

ShapeLineIcon.displayName = "ShapeLineIcon";
