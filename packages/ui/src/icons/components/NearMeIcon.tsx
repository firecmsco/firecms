import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NearMeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"near_me"} ref={ref}/>
});

NearMeIcon.displayName = "NearMeIcon";
