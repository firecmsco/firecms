import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BentoIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"bento"} ref={ref}/>
});

BentoIcon.displayName = "BentoIcon";
