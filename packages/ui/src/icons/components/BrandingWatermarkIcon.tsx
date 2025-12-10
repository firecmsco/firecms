import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BrandingWatermarkIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"branding_watermark"} ref={ref}/>
});

BrandingWatermarkIcon.displayName = "BrandingWatermarkIcon";
