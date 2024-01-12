import { Typography } from "@firecms/ui";

export function FieldHelperView({
                                    error,
                                    children
                                }: { error?: boolean, children?: React.ReactNode }) {
    if (!children) return null;
    return (
        <Typography variant={"caption"}
                    color={error ? "error" : undefined}
                    className={"ml-3.5 mt-0.5 text-gray-800 dark:text-gray-200"}>
            {children}
        </Typography>
    );
}
