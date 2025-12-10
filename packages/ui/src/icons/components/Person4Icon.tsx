import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Person4Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"person_4"} ref={ref}/>
});

Person4Icon.displayName = "Person4Icon";
