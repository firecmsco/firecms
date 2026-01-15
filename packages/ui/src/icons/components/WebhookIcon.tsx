import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WebhookIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"webhook"} ref={ref}/>
});

WebhookIcon.displayName = "WebhookIcon";
