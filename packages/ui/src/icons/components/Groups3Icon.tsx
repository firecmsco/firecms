import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Groups3Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"groups_3"} ref={ref}/>
});

Groups3Icon.displayName = "Groups3Icon";
