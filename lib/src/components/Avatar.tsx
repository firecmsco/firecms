import React from "react";

interface AvatarProps {
    src?: string;
    alt?: string;
    children?: React.ReactNode;
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
                                                  src,
                                                  alt,
                                                  children,
                                                  className
                                              }) => {
    return (
        <div className={`flex items-center justify-center overflow-hidden rounded-full ${className} bg-primary w-10 h-10`}>
            {src
                ? (
                    <img className="object-cover w-full h-full" src={src} alt={alt}/>
                )
                : (
                    <span className="text-lg font-medium text-white">{children}</span>
                )}
        </div>
    );
};
