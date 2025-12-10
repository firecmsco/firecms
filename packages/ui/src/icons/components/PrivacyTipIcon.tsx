import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PrivacyTipIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"privacy_tip"} ref={ref}/>
});

PrivacyTipIcon.displayName = "PrivacyTipIcon";
