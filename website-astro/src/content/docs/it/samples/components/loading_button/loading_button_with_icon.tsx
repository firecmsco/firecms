import React from "react";
import { AddIcon, LoadingButton } from "@firecms/ui";

export default function LoadingButtonWithIconDemo() {
    const [loading, setLoading] = React.useState(false);

    const onClick = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    return (
        <LoadingButton
            startIcon={<AddIcon size={"small"}/>}
            loading={loading}
            onClick={onClick}>
            Click Me
        </LoadingButton>
    );
}
