import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CenterFocusStrongIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"center_focus_strong"} ref={ref}/>
});

CenterFocusStrongIcon.displayName = "CenterFocusStrongIcon";
