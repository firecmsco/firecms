import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HeadphonesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"headphones"} ref={ref}/>
});

HeadphonesIcon.displayName = "HeadphonesIcon";
