import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const WhereToVoteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"where_to_vote"} ref={ref}/>
});

WhereToVoteIcon.displayName = "WhereToVoteIcon";
