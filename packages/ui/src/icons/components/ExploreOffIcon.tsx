import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExploreOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"explore_off"} ref={ref}/>
});

ExploreOffIcon.displayName = "ExploreOffIcon";
