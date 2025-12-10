import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SynagogueIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"synagogue"} ref={ref}/>
});

SynagogueIcon.displayName = "SynagogueIcon";
