import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SportsMartialArtsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sports_martial_arts"} ref={ref}/>
});

SportsMartialArtsIcon.displayName = "SportsMartialArtsIcon";
