import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpellcheckIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"spellcheck"} ref={ref}/>
});

SpellcheckIcon.displayName = "SpellcheckIcon";
