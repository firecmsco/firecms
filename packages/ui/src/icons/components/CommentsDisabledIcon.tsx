import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CommentsDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"comments_disabled"} ref={ref}/>
});

CommentsDisabledIcon.displayName = "CommentsDisabledIcon";
