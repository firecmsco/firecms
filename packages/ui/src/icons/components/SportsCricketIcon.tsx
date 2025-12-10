import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsCricketIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_cricket"} ref={ref}/>
});

SportsCricketIcon.displayName = "SportsCricketIcon";
