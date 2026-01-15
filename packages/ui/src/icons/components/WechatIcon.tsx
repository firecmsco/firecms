import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WechatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"wechat"} ref={ref}/>
});

WechatIcon.displayName = "WechatIcon";
