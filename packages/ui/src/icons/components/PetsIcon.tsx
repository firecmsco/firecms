import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PetsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pets"} ref={ref}/>
});

PetsIcon.displayName = "PetsIcon";
