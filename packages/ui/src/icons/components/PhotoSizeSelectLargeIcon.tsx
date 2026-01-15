import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhotoSizeSelectLargeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"photo_size_select_large"} ref={ref}/>
});

PhotoSizeSelectLargeIcon.displayName = "PhotoSizeSelectLargeIcon";
