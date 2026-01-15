import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FilterDramaIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"filter_drama"} ref={ref}/>
});

FilterDramaIcon.displayName = "FilterDramaIcon";
