import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ModeStandbyIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mode_standby"} ref={ref}/>
});

ModeStandbyIcon.displayName = "ModeStandbyIcon";
