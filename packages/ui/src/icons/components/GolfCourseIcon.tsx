import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GolfCourseIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"golf_course"} ref={ref}/>
});

GolfCourseIcon.displayName = "GolfCourseIcon";
