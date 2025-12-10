import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PostAddIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"post_add"} ref={ref}/>
});

PostAddIcon.displayName = "PostAddIcon";
