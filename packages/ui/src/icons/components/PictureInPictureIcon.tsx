import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PictureInPictureIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"picture_in_picture"} ref={ref}/>
});

PictureInPictureIcon.displayName = "PictureInPictureIcon";
