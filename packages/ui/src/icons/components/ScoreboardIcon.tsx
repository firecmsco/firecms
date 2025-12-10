import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ScoreboardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"scoreboard"} ref={ref}/>
});

ScoreboardIcon.displayName = "ScoreboardIcon";
