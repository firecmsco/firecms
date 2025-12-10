import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UnfoldMoreIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"unfold_more"} ref={ref}/>
});

UnfoldMoreIcon.displayName = "UnfoldMoreIcon";
