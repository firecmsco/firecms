import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HearingDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hearing_disabled"} ref={ref}/>
});

HearingDisabledIcon.displayName = "HearingDisabledIcon";
