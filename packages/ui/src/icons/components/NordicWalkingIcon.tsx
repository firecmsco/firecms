import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NordicWalkingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"nordic_walking"} ref={ref}/>
});

NordicWalkingIcon.displayName = "NordicWalkingIcon";
