import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EggAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"egg_alt"} ref={ref}/>
});

EggAltIcon.displayName = "EggAltIcon";
