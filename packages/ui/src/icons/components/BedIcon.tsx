import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bed"} ref={ref}/>
});

BedIcon.displayName = "BedIcon";
