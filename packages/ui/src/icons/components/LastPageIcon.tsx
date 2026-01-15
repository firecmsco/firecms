import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LastPageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"last_page"} ref={ref}/>
});

LastPageIcon.displayName = "LastPageIcon";
