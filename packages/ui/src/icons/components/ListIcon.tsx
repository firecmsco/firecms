import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ListIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"list"} ref={ref}/>
});

ListIcon.displayName = "ListIcon";
