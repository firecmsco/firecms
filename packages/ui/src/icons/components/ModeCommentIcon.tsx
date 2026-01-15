import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ModeCommentIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mode_comment"} ref={ref}/>
});

ModeCommentIcon.displayName = "ModeCommentIcon";
