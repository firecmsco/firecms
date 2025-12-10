import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BlurCircularIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"blur_circular"} ref={ref}/>
});

BlurCircularIcon.displayName = "BlurCircularIcon";
