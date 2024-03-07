import { Typography } from "@firecms/ui";

export function FieldCaption({
                                    error,
                                    children
                                }: { error?: boolean, children?: React.ReactNode }) {
    if (!children) return null;
    return (
        <Typography variant={"caption"} color={error ? "error" : "secondary"} className={"ml-3.5 mt-0.5"}>
            {children}
        </Typography>
    );
}
