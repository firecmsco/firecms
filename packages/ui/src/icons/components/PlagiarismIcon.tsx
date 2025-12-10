import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PlagiarismIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"plagiarism"} ref={ref}/>
});

PlagiarismIcon.displayName = "PlagiarismIcon";
