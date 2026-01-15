import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChildCareIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"child_care"} ref={ref}/>
});

ChildCareIcon.displayName = "ChildCareIcon";
