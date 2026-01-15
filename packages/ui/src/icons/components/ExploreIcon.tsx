import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExploreIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"explore"} ref={ref}/>
});

ExploreIcon.displayName = "ExploreIcon";
