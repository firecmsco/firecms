import { useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollProps {
    hasMore: boolean;
    loading: boolean;
    onLoadMore: () => void;
    threshold?: number;
}

/**
 * Hook for infinite scrolling functionality
 */
export function useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore,
    threshold = 100
}: UseInfiniteScrollProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
        if (!containerRef.current || loading || !hasMore) {
            return;
        }

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        
        // Check if we're near the bottom (within threshold pixels)
        if (scrollHeight - scrollTop - clientHeight < threshold) {
            onLoadMore();
        }
    }, [loading, hasMore, onLoadMore, threshold]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    return { containerRef };
}