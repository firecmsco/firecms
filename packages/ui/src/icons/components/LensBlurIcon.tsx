import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LensBlurIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lens_blur"} ref={ref}/>
});

LensBlurIcon.displayName = "LensBlurIcon";
