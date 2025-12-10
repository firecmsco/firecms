import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FavoriteOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"favorite_outline"} ref={ref}/>
});

FavoriteOutlineIcon.displayName = "FavoriteOutlineIcon";
