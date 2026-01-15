import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AdjustIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"adjust"} ref={ref}/>
});

AdjustIcon.displayName = "AdjustIcon";
