import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WebAssetOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"web_asset_off"} ref={ref}/>
});

WebAssetOffIcon.displayName = "WebAssetOffIcon";
