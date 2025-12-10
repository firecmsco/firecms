import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FavoriteBorderIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"favorite_border"} ref={ref}/>
});

FavoriteBorderIcon.displayName = "FavoriteBorderIcon";
