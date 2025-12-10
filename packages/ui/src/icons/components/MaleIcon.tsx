import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MaleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"male"} ref={ref}/>
});

MaleIcon.displayName = "MaleIcon";
