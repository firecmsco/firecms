import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StayCurrentPortraitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stay_current_portrait"} ref={ref}/>
});

StayCurrentPortraitIcon.displayName = "StayCurrentPortraitIcon";
