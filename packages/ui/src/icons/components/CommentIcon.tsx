import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CommentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"comment"} ref={ref}/>
});

CommentIcon.displayName = "CommentIcon";
