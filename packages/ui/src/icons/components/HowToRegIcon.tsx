import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HowToRegIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"how_to_reg"} ref={ref}/>
});

HowToRegIcon.displayName = "HowToRegIcon";
