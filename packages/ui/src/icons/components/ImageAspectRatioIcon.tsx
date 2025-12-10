import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ImageAspectRatioIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"image_aspect_ratio"} ref={ref}/>
});

ImageAspectRatioIcon.displayName = "ImageAspectRatioIcon";
