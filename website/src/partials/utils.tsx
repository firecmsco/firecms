import React from "react";

export const CTAOutlinedButtonMixin = "btn px-12 py-4 border-1 border-gray-600 dark:border-gray-700 font-bold uppercase rounded border-solid dark:text-white text-gray-800 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-gray-500 dark:hover:border-gray-800";
export const CTAOutlinedButtonWhiteMixin = "btn px-12 py-4 border-1 border-white font-bold uppercase rounded border-solid text-white hover:bg-gray-200 hover:border-gray-200";
export const CTAButtonMixin = "btn px-12 font-bold py-4 text-white bg-primary hover:text-white hover:bg-blue-700 font-bold hover:text-white uppercase border-solid rounded ";
export const ContainerMixin = "relative max-w-6xl mx-auto p-4";

export const CTACaret = () => <svg aria-hidden="true"
                                   className="w-5 h-5 ml-2 -mr-1"
                                   fill="currentColor" viewBox="0 0 20 20"
                                   xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd"
          d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
          clip-rule="evenodd"></path>
</svg>;

