import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ImageNotSupportedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"image_not_supported"} ref={ref}/>
});

ImageNotSupportedIcon.displayName = "ImageNotSupportedIcon";
