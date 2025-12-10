import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ImagesearchRollerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"imagesearch_roller"} ref={ref}/>
});

ImagesearchRollerIcon.displayName = "ImagesearchRollerIcon";
