import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsGymnasticsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_gymnastics"} ref={ref}/>
});

SportsGymnasticsIcon.displayName = "SportsGymnasticsIcon";
