import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UnfoldLessIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"unfold_less"} ref={ref}/>
});

UnfoldLessIcon.displayName = "UnfoldLessIcon";
