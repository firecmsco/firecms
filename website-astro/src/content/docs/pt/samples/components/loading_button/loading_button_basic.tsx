import React from "react";
import { LoadingButton } from "@firecms/ui";

export default function LoadingButtonBasicDemo() {
    const [loading, setLoading] = React.useState(false);

    const onClick = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    return (
        <LoadingButton
            loading={loading}
            onClick={onClick}>
                Click Me
        </LoadingButton>
    );
}
