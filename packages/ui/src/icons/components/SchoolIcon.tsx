import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SchoolIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"school"} ref={ref}/>
});

SchoolIcon.displayName = "SchoolIcon";
