import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RequestPageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"request_page"} ref={ref}/>
});

RequestPageIcon.displayName = "RequestPageIcon";
