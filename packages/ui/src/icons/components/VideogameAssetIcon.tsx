import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const VideogameAssetIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"videogame_asset"} ref={ref}/>
});

VideogameAssetIcon.displayName = "VideogameAssetIcon";
