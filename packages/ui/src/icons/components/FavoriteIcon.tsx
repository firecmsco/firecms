import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FavoriteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"favorite"} ref={ref}/>
});

FavoriteIcon.displayName = "FavoriteIcon";
