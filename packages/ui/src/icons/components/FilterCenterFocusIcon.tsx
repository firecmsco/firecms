import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FilterCenterFocusIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_center_focus"} ref={ref}/>
});

FilterCenterFocusIcon.displayName = "FilterCenterFocusIcon";
