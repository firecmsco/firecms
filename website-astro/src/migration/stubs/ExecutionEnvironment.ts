// Enhanced ExecutionEnvironment stub to emulate the Docusaurus runtime helpers
// Add more feature flags used by some components to guard browser-only logic.

interface ExecutionEnvironmentLike {
  canUseDOM: boolean;
  canUseEventListeners: boolean;
  canUseIntersectionObserver: boolean;
  isServer: boolean;
}

const ExecutionEnvironment: ExecutionEnvironmentLike = {
  canUseDOM: typeof window !== "undefined" && typeof document !== "undefined",
  canUseEventListeners: typeof window !== "undefined" && !!window.addEventListener,
  canUseIntersectionObserver: typeof window !== "undefined" && "IntersectionObserver" in window,
  isServer: typeof window === "undefined"
};

export default ExecutionEnvironment;
