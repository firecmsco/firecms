import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SailingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sailing"} ref={ref}/>
});

SailingIcon.displayName = "SailingIcon";
