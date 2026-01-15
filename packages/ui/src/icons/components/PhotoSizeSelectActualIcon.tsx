import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PhotoSizeSelectActualIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"photo_size_select_actual"} ref={ref}/>
});

PhotoSizeSelectActualIcon.displayName = "PhotoSizeSelectActualIcon";
