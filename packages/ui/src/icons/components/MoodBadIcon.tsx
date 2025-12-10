import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MoodBadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mood_bad"} ref={ref}/>
});

MoodBadIcon.displayName = "MoodBadIcon";
