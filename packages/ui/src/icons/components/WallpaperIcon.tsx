import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WallpaperIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wallpaper"} ref={ref}/>
});

WallpaperIcon.displayName = "WallpaperIcon";
