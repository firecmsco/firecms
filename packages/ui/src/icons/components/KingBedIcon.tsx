import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const KingBedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"king_bed"} ref={ref}/>
});

KingBedIcon.displayName = "KingBedIcon";
