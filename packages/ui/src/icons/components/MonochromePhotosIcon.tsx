import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MonochromePhotosIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"monochrome_photos"} ref={ref}/>
});

MonochromePhotosIcon.displayName = "MonochromePhotosIcon";
