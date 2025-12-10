import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GamesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"games"} ref={ref}/>
});

GamesIcon.displayName = "GamesIcon";
