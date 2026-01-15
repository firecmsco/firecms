import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GradeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"grade"} ref={ref}/>
});

GradeIcon.displayName = "GradeIcon";
