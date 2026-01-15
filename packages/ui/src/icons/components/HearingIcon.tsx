import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HearingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hearing"} ref={ref}/>
});

HearingIcon.displayName = "HearingIcon";
