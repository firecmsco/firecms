import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CropRotateIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"crop_rotate"} ref={ref}/>
});

CropRotateIcon.displayName = "CropRotateIcon";
