import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FeedbackIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"feedback"} ref={ref}/>
});

FeedbackIcon.displayName = "FeedbackIcon";
