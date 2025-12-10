import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CropLandscapeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"crop_landscape"} ref={ref}/>
});

CropLandscapeIcon.displayName = "CropLandscapeIcon";
