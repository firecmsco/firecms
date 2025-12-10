import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WorkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"work"} ref={ref}/>
});

WorkIcon.displayName = "WorkIcon";
