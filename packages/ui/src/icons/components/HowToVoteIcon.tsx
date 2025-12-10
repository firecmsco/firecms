import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HowToVoteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"how_to_vote"} ref={ref}/>
});

HowToVoteIcon.displayName = "HowToVoteIcon";
