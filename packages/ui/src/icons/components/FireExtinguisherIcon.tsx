import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FireExtinguisherIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fire_extinguisher"} ref={ref}/>
});

FireExtinguisherIcon.displayName = "FireExtinguisherIcon";
