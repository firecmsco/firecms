import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RiceBowlIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rice_bowl"} ref={ref}/>
});

RiceBowlIcon.displayName = "RiceBowlIcon";
