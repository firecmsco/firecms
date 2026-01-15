import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ApprovalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"approval"} ref={ref}/>
});

ApprovalIcon.displayName = "ApprovalIcon";
