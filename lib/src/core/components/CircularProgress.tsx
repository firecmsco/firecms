import React from "react";

export const CircularProgress = () => {
    return <div
        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status">
  <span
      className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
  >Loading...</span
  >
    </div>;
    return (
        <span className="flex h-3 w-3">
            <span className="animate-spin relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
    );
};
