import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StayPrimaryPortraitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stay_primary_portrait"} ref={ref}/>
});

StayPrimaryPortraitIcon.displayName = "StayPrimaryPortraitIcon";
