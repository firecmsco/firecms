import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FireHydrantAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fire_hydrant_alt"} ref={ref}/>
});

FireHydrantAltIcon.displayName = "FireHydrantAltIcon";
