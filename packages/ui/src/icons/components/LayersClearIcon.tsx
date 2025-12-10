import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LayersClearIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"layers_clear"} ref={ref}/>
});

LayersClearIcon.displayName = "LayersClearIcon";
