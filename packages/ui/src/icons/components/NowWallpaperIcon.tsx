import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NowWallpaperIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"now_wallpaper"} ref={ref}/>
});

NowWallpaperIcon.displayName = "NowWallpaperIcon";
