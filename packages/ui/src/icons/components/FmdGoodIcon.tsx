import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FmdGoodIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fmd_good"} ref={ref}/>
});

FmdGoodIcon.displayName = "FmdGoodIcon";
