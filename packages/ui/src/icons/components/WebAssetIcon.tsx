import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WebAssetIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"web_asset"} ref={ref}/>
});

WebAssetIcon.displayName = "WebAssetIcon";
