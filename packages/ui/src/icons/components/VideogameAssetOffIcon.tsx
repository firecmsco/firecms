import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VideogameAssetOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"videogame_asset_off"} ref={ref}/>
});

VideogameAssetOffIcon.displayName = "VideogameAssetOffIcon";
