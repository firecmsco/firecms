import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TerrainIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"terrain"} ref={ref}/>
});

TerrainIcon.displayName = "TerrainIcon";
