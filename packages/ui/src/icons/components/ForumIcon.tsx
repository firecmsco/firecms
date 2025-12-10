import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ForumIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"forum"} ref={ref}/>
});

ForumIcon.displayName = "ForumIcon";
