import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhotoSizeSelectSmallIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"photo_size_select_small"} ref={ref}/>
});

PhotoSizeSelectSmallIcon.displayName = "PhotoSizeSelectSmallIcon";
