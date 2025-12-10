import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BatterySaverIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"battery_saver"} ref={ref}/>
});

BatterySaverIcon.displayName = "BatterySaverIcon";
