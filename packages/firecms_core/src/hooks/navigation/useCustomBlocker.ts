import { useState } from "react";
import { useBlocker } from "react-router-dom";

export type NavigationBlocker = {
    updateBlockListener: (path: string, block: boolean, basePath?: string) => () => void;
    isBlocked: (path: string) => boolean;
    proceed?: () => void;
    reset?: () => void;
};

export function useCustomBlocker(): NavigationBlocker {
    const [blockListeners, setBlockListeners] = useState<Record<string, {
        block: boolean,
        basePath?: string
    }>>({});

    const shouldBlock = Object.values(blockListeners).some(b => b.block);

    let blocker: any;
    try {
        blocker = useBlocker(({
            nextLocation
        }) => {
            const allBasePaths = Object.values(blockListeners).map(b => b.basePath).filter(Boolean) as string[];
            if (allBasePaths && allBasePaths.some(path => nextLocation.pathname.startsWith(path)))
                return false;
            return shouldBlock;
        });
    } catch (e) {
        // console.warn("Blocker not available, navigation will not be blocked");
    }

    const updateBlockListener = (path: string, block: boolean, basePath?: string) => {
        setBlockListeners(prev => ({
            ...prev,
            [path]: {
                block,
                basePath
            }
        }));
        return () => setBlockListeners(prev => {
            const {
                [path]: removed,
                ...rest
            } = prev;
            return rest;
        });
    };

    const isBlocked = (path: string) => {
        return (blockListeners[path]?.block ?? false) && blocker?.state === "blocked";
    }

    return {
        updateBlockListener,
        isBlocked,
        proceed: blocker?.proceed,
        reset: blocker?.reset
    }
}
