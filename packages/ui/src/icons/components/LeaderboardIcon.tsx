import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LeaderboardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"leaderboard"} ref={ref}/>
});

LeaderboardIcon.displayName = "LeaderboardIcon";
