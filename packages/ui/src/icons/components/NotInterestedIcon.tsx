import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NotInterestedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"not_interested"} ref={ref}/>
});

NotInterestedIcon.displayName = "NotInterestedIcon";
