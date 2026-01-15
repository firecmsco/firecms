import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NearMeDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"near_me_disabled"} ref={ref}/>
});

NearMeDisabledIcon.displayName = "NearMeDisabledIcon";
