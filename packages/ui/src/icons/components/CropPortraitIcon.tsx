import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CropPortraitIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"crop_portrait"} ref={ref}/>
});

CropPortraitIcon.displayName = "CropPortraitIcon";
