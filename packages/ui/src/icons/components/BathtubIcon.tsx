import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BathtubIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bathtub"} ref={ref}/>
});

BathtubIcon.displayName = "BathtubIcon";
