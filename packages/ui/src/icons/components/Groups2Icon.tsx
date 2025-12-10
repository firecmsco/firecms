import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Groups2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"groups_2"} ref={ref}/>
});

Groups2Icon.displayName = "Groups2Icon";
