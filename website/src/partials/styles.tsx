import React from "react";

export const CTAOutlinedButtonMixin = "btn px-10 py-4 md:px-12 border-1 border-solid border-gray-900 border-opacity-70 dark:border-gray-950 dark:border-opacity-80 uppercase rounded border-solid text-inherit dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 h dark:hover:border-gray-800 text-center";
export const CTAOutlinedButtonWhiteMixin = "btn px-10 py-4 md:px-12  border-1 border-white  uppercase rounded border-solid text-white dark:text-white hover:bg-gray-200 hover:border-gray-200 text-center";
export const CTAButtonMixin = "btn px-10 py-4 md:px-12 text-white bg-primary hover:text-white hover:bg-blue-700  hover:text-white uppercase border-solid rounded text-center";
export const CTAButtonDarkMixin = "btn px-10 py-4 md:px-12 border-1 border-gray-700 uppercase rounded border-solid text-white bg-gray-950 bg-opacity-75 hover:bg-opacity-100 hover:text-gray-100 hover:border-gray-800 text-center";

export const CTAButtonMixinLight = "btn px-10 py-4 md:px-12 text-text-primary bg-primary hover:text-white hover:bg-blue-700  hover:text-white uppercase border-solid rounded text-center";


export const ContainerMixin = "relative max-w-full w-[84rem] mx-auto";
export const ContainerSmallMixin = "relative max-w-5xl mx-auto p-4";
export const ContainerPaddingMixin = "py-12 md:py-16 p-4 md:p-8";
export const ContainerInnerPaddingMixin = "px-8 py-8 md:px-8 md:py-12";

export const defaultBorderMixin = "border-solid border-gray-900 border-opacity-50 dark:border-gray-950 dark:border-opacity-60";


export const CTACaret = () => <svg aria-hidden="true"
                                   className="w-5 h-5 ml-2 -mr-1"
                                   fill="currentColor" viewBox="0 0 20 20"
                                   xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd"
          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
          clip-rule="evenodd"></path>
</svg>;

export function easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

