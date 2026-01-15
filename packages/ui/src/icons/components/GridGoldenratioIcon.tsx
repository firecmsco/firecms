import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GridGoldenratioIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"grid_goldenratio"} ref={ref}/>
});

GridGoldenratioIcon.displayName = "GridGoldenratioIcon";
