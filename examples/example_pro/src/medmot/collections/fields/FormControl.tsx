import { Property } from "@firecms/core";

export function FormControl({
                                children,
                                disabled,
                                error,
                                required = false,
                                fullWidth = true
                            }: {
    disabled?: boolean;
    error?: boolean;
    children: React.ReactNode;
    required?: boolean;
    fullWidth?: boolean;
}) {
    return (
        <div
            className={`flex flex-col ${required ? 'required' : ''} ${error ? 'border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${fullWidth ? 'w-full' : ''}`}
        >
            {children}
        </div>
    );
}
