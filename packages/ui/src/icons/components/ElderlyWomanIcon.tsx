import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ElderlyWomanIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"elderly_woman"} ref={ref}/>
});

ElderlyWomanIcon.displayName = "ElderlyWomanIcon";
