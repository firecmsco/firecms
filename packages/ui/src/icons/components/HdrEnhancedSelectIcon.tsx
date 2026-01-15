import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HdrEnhancedSelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hdr_enhanced_select"} ref={ref}/>
});

HdrEnhancedSelectIcon.displayName = "HdrEnhancedSelectIcon";
