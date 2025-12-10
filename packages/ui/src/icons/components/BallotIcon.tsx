import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BallotIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ballot"} ref={ref}/>
});

BallotIcon.displayName = "BallotIcon";
